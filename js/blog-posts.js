/*
  Manifest of local, file-based blog posts — the team's own long-form guides,
  as opposed to the Firebase-backed community posts in blog.html/dashboard.html.

  Single-page post — one entry, one file:
    { slug, title, category, date, author, summary, cover, file }

  Multi-page post (a series shown as one blog entry with page navigation) —
  same fields, but a "pages" array instead of a single "file":
    { slug, title, category, date, author, summary, cover,
      pages: [ { title, file }, ... ] }
    Reach page N at post.html?slug=<slug>&page=N (1-indexed, defaults to 1).

  To add a new one: make a folder under blog-posts/<slug>/ with an index.md
  (plain Markdown, GitHub-flavored — tables, fenced code, images all work)
  and an images/ subfolder for anything it references, then add one entry
  below. That's it — blog.html and post.html both read from this list.
*/
window.LOCAL_POSTS = [
  {
    slug: "camera-mipi-csi-2",
    title: "Camera & MIPI CSI-2",
    category: "Sensors & Vision",
    date: "2026-08-26",
    author: "LRX-Labs",
    summary: "A 4-part series: camera sensor parts and the ISP pipeline, the MIPI CSI-2 link itself, colour formats and embedded metadata, exposure/HDR/colour-balancing controls, and a hands-on OV5640/STM32H7R7 bring-up guide.",
    cover: "blog-posts/mipi-csi-2/images/MIPI-Camera.png",
    pages: [
      { title: "Camera MIPI CSI-2", file: "blog-posts/mipi-csi-2/index.md" },
      { title: "Camera Colour Formats & Pixel Metadata", file: "blog-posts/camera-colors/index.md" },
      { title: "Camera Settings & Colour Balancing", file: "blog-posts/color-balancing/index.md" },
      { title: "OV5640 → STM32H7R7 Bring-up Guide", file: "blog-posts/ov5640-stm32-bringup/index.md" }
    ]
  }
];

window.getLocalPost = function(slug){
  return window.LOCAL_POSTS.find(function(p){ return p.slug === slug; });
};
