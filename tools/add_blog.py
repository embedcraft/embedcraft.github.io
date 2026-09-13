#!/usr/bin/env python3
"""Add or update a local blog post on the DigiEdge site.

Takes a Markdown file you wrote elsewhere (e.g. in a TechBlogs-style working
folder) and wires it into blog-posts/, js/blog-posts.js and sitemap.xml the
same way it was done by hand for the camera/MIPI-CSI-2 series.

Example:
  tools/add_blog.py --source ~/projects/TechBlogs/blogs/FOO/blog.md \\
      --slug my-new-post --title "My New Post" --category Firmware \\
      --summary "One or two sentences describing the post."

Run with --dry-run first to preview every change before anything is written.
See --help for the full option list.
"""
import argparse
import datetime
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG_POSTS_DIR = ROOT / "blog-posts"
MANIFEST = ROOT / "js" / "blog-posts.js"
POSTS_JS = ROOT / "js" / "posts.js"
SITEMAP = ROOT / "sitemap.xml"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}

BADGE_PATTERNS = [
    re.compile(r'<a href="https://github\.com/[^"]*\?tab=followers">.*?</a>\s*', re.DOTALL),
    re.compile(r'!\[Views\]\(https://visitor-badge[^)]*\)\s*'),
    re.compile(r'!\[Last local commit\]\(https://img\.shields\.io/badge/commit[^)]*\)\s*'),
]


def slugify(name):
    stem = Path(name).stem
    return re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-")


def load_existing_slugs():
    if not MANIFEST.exists():
        return set()
    text = MANIFEST.read_text()
    return set(re.findall(r'slug:\s*"([^"]+)"', text))


def load_categories():
    if not POSTS_JS.exists():
        return []
    text = POSTS_JS.read_text()
    m = re.search(r"POST_CATEGORIES\s*=\s*\[(.*?)\]", text, re.DOTALL)
    if not m:
        return []
    return re.findall(r'"([^"]+)"', m.group(1))


def strip_badges(content):
    for pat in BADGE_PATTERNS:
        content = pat.sub("", content)
    return re.sub(r"\n{3,}", "\n\n", content)


def extract_title(content, fallback):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", content, re.DOTALL)
    if m:
        inner = re.sub(r"<[^>]+>", " ", m.group(1))
        inner = re.sub(r"\s+", " ", inner).strip()
        if inner:
            return inner
    m = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return fallback


def find_local_refs(content, pattern):
    """Local (non-http) paths referenced via markdown images/links or raw src=."""
    refs = set()
    for m in re.finditer(pattern, content):
        path = m.group(1)
        if path.startswith(("http://", "https://", "mailto:", "post.html")):
            continue
        refs.add(path)
    return refs


def copy_asset(src_path, source_md_dir, images_dir_override, dest_dir, label, dry_run):
    candidates = [source_md_dir / src_path]
    if images_dir_override:
        candidates.append(images_dir_override / Path(src_path).name)
    candidates.append(source_md_dir / Path(src_path).name)

    resolved = next((c.resolve() for c in candidates if c.exists()), None)
    if not resolved:
        print(f"  ! could not find {label} '{src_path}' — tried: "
              + ", ".join(str(c) for c in candidates))
        return None

    dest = dest_dir / resolved.name
    if not dry_run:
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(resolved, dest)
    print(f"  copied {label}: {resolved} -> {dest.relative_to(ROOT)}")
    return resolved.name


def rewrite_crosslinks(content, existing_slugs, current_slug):
    def repl(m):
        target = m.group(1)
        if target.startswith(("http://", "https://", "post.html", "images/", "files/")):
            return m.group(0)
        if not target.endswith(".md"):
            return m.group(0)
        guess = slugify(target)
        if guess == current_slug:
            return m.group(0)
        if guess in existing_slugs:
            return m.group(0).replace(target, f"post.html?slug={guess}")
        print(f"  ! unresolved cross-link to '{target}' (guessed slug '{guess}', "
              f"not found in js/blog-posts.js) — left as-is, fix manually if needed")
        return m.group(0)
    return re.sub(r"\]\(([^)]+)\)", repl, content)


def build_manifest_entry(slug, title, category, date, author, summary, cover_rel, file_rel):
    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')
    return (
        "  {\n"
        f'    slug: "{esc(slug)}",\n'
        f'    title: "{esc(title)}",\n'
        f'    category: "{esc(category)}",\n'
        f'    date: "{esc(date)}",\n'
        f'    author: "{esc(author)}",\n'
        f'    summary: "{esc(summary)}",\n'
        f'    file: "{esc(file_rel)}",\n'
        f'    cover: "{esc(cover_rel)}"\n'
        "  }"
    )


def update_manifest(slug, entry_text, dry_run):
    text = MANIFEST.read_text()
    existing_pat = re.compile(
        r"[ \t]*\{\s*\n\s*slug:\s*\"" + re.escape(slug) + r"\".*?\n\s*\}", re.DOTALL
    )
    if existing_pat.search(text):
        new_text = existing_pat.sub(entry_text, text, count=1)
        action = "updated"
    else:
        m = re.search(r"window\.LOCAL_POSTS\s*=\s*\[(.*?)\n\];", text, re.DOTALL)
        if not m:
            sys.exit("Could not find 'window.LOCAL_POSTS = [ ... ];' in js/blog-posts.js")
        body = m.group(1)
        stripped = body.rstrip()
        if stripped == "":
            new_body = "\n" + entry_text
        elif stripped.endswith(","):
            new_body = stripped + "\n" + entry_text
        else:
            new_body = stripped + ",\n" + entry_text
        new_text = text[: m.start(1)] + new_body + text[m.end(1):]
        action = "added"
    if dry_run:
        print(f"  would {action} manifest entry for '{slug}' in {MANIFEST.relative_to(ROOT)}")
    else:
        MANIFEST.write_text(new_text)
        print(f"  {action} manifest entry for '{slug}' in {MANIFEST.relative_to(ROOT)}")


def update_categories(category, categories, dry_run):
    if category in categories:
        return
    print(f"  category '{category}' is new — adding it to POST_CATEGORIES")
    if dry_run:
        return
    text = POSTS_JS.read_text()
    new_text = re.sub(
        r'(POST_CATEGORIES\s*=\s*\[)(.*?)(\])',
        lambda m: m.group(1) + m.group(2).rstrip().rstrip(",") + f', "{category}"' + m.group(3),
        text,
        count=1,
        flags=re.DOTALL,
    )
    POSTS_JS.write_text(new_text)


def update_sitemap(slug, date, dry_run):
    loc = f"https://digiedge.github.io/post.html?slug={slug}"
    if not SITEMAP.exists():
        return
    text = SITEMAP.read_text()
    if loc in text:
        return
    entry = (
        f"  <url>\n    <loc>{loc}</loc>\n"
        f"    <lastmod>{date}</lastmod>\n"
        f"    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n"
    )
    new_text = text.replace("</urlset>", entry + "</urlset>")
    if dry_run:
        print(f"  would add sitemap entry for {loc}")
    else:
        SITEMAP.write_text(new_text)
        print(f"  added sitemap entry for {loc}")


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--source", required=True, help="path to the source .md file")
    parser.add_argument("--slug", required=True, help="URL slug, e.g. my-new-post")
    parser.add_argument("--title", help="post title (auto-detected from an <h1>/# heading if omitted)")
    parser.add_argument("--category", required=True, help="one of POST_CATEGORIES, or a new one to add")
    parser.add_argument("--author", default="LRX-Labs")
    parser.add_argument("--date", default=datetime.date.today().isoformat(), help="YYYY-MM-DD, default today")
    parser.add_argument("--summary", required=True, help="one or two sentence summary for the blog cards")
    parser.add_argument("--images-dir", type=Path, help="fallback directory to search for referenced images")
    parser.add_argument("--attach", nargs="*", default=[], help="extra files (PDF, source code, etc.) to copy into files/ and make downloadable")
    parser.add_argument("--cover", help="filename (within the copied images) to use as the cover image; defaults to the first image copied")
    parser.add_argument("--keep-badges", action="store_true", help="don't strip GitHub follow/view-counter/commit badges")
    parser.add_argument("--force", action="store_true", help="overwrite an existing blog-posts/<slug>/ folder")
    parser.add_argument("--dry-run", action="store_true", help="preview everything without writing any files")
    args = parser.parse_args()

    source = Path(args.source).expanduser().resolve()
    if not source.exists():
        sys.exit(f"Source file not found: {source}")

    slug = args.slug
    post_dir = BLOG_POSTS_DIR / slug
    if post_dir.exists() and not args.force and not args.dry_run:
        sys.exit(f"{post_dir.relative_to(ROOT)} already exists — pass --force to overwrite")

    content = source.read_text()
    if not args.keep_badges:
        content = strip_badges(content)

    title = args.title or extract_title(content, fallback=slug.replace("-", " ").title())
    source_dir = source.parent
    images_dir_override = args.images_dir.expanduser().resolve() if args.images_dir else None

    print(f"Adding post '{slug}' from {source}")

    # 1. images referenced via markdown ![](...) and raw <img src="...">
    img_refs = find_local_refs(content, r'!\[[^\]]*\]\(([^)]+)\)') | find_local_refs(content, r'src="([^"]+)"')
    img_refs = {r for r in img_refs if Path(r).suffix.lower() in IMAGE_EXTS}

    dest_images = post_dir / "images"
    copied_images = []
    for ref in sorted(img_refs):
        basename = copy_asset(ref, source_dir, images_dir_override, dest_images, "image", args.dry_run)
        if basename:
            copied_images.append((ref, basename))
            content = content.replace(f'src="{ref}"', f'src="images/{basename}"')
            content = content.replace(f']({ref})', f'](images/{basename})')

    # 2. flag any other local (non-image, non-.md) links so the user decides whether to
    #    attach them -- .md links are handled separately below as cross-links
    other_refs = find_local_refs(content, r'\]\(([^)]+)\)')
    other_refs = {
        r for r in other_refs
        if Path(r).suffix.lower() not in IMAGE_EXTS
        and Path(r).suffix.lower() != ".md"
        and not r.startswith("post.html")
    }
    attach_basenames = {Path(a).name for a in args.attach}
    for ref in sorted(other_refs):
        if Path(ref).name not in attach_basenames and Path(ref).suffix:
            print(f"  ! local link to '{ref}' is not in --attach — it will not resolve on the site "
                  f"unless you pass --attach {source_dir / ref} or fix the link by hand")

    # 3. explicit attachments -> files/
    dest_files = post_dir / "files"
    for attach_path in args.attach:
        attach_path = Path(attach_path).expanduser().resolve()
        if not attach_path.exists():
            print(f"  ! --attach file not found: {attach_path}")
            continue
        if not args.dry_run:
            dest_files.mkdir(parents=True, exist_ok=True)
            shutil.copy2(attach_path, dest_files / attach_path.name)
        print(f"  attached: {attach_path} -> {(dest_files / attach_path.name).relative_to(ROOT)}")
        content = content.replace(f"]({attach_path.name})", f"](files/{attach_path.name})")

    # 4. cross-links to other local posts
    existing_slugs = load_existing_slugs()
    content = rewrite_crosslinks(content, existing_slugs, slug)

    # 5. write index.md
    index_path = post_dir / "index.md"
    if args.dry_run:
        print(f"  would write {index_path.relative_to(ROOT)} ({len(content)} chars)")
    else:
        post_dir.mkdir(parents=True, exist_ok=True)
        index_path.write_text(content)
        print(f"  wrote {index_path.relative_to(ROOT)}")

    # 6. manifest entry
    cover_name = args.cover or (copied_images[0][1] if copied_images else None)
    cover_rel = f"blog-posts/{slug}/images/{cover_name}" if cover_name else ""
    entry_text = build_manifest_entry(
        slug, title, args.category, args.date, args.author, args.summary,
        cover_rel, f"blog-posts/{slug}/index.md",
    )
    update_manifest(slug, entry_text, args.dry_run)

    # 7. category + sitemap
    update_categories(args.category, load_categories(), args.dry_run)
    update_sitemap(slug, args.date, args.dry_run)

    print(f"\nDone. {'(dry run, nothing written)' if args.dry_run else ''}")
    print(f"Preview at: post.html?slug={slug}")


if __name__ == "__main__":
    main()
