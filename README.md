# DigiEdge

Company website. Live at https://digiedge.github.io

Built as static HTML/CSS/JS, hosted on GitHub Pages — `index.html` is the
homepage; `login.html`, `signup.html`, `dashboard.html` and `blog.html` add
user accounts and a public blog on top of it.

## Blog & accounts setup (Firebase)

The blog and accounts (sign up, sign in, write/edit/delete posts) run on
[Firebase](https://firebase.google.com) — Authentication for accounts,
Firestore for storing posts. A static GitHub Pages site can't run its own
server or database, so this is the piece that has to be connected before
those pages work. Until it's connected, `login.html` / `signup.html` /
`dashboard.html` / `blog.html` show a "not configured yet" notice instead of
pretending to work.

**Setup (free Spark plan is enough):**

1. Go to the [Firebase console](https://console.firebase.google.com) → **Add project**.
2. **Project settings → General → Your apps → Add app → Web (`</>`)** → register it (no Firebase Hosting needed, this site already lives on GitHub Pages).
3. Copy the config object Firebase shows you into `js/firebase-config.js`, replacing the `YOUR_...` placeholders in `window.FIREBASE_CONFIG`.
4. **Build → Authentication → Get started** → enable the **Email/Password** sign-in provider.
5. **Build → Firestore Database → Create database** → start in production mode, pick a region.
6. In **Firestore → Rules**, replace the default rules with the ones below and click **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if true;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }

    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.title is string
        && request.resource.data.title.size() > 0
        && request.resource.data.title.size() < 200
        && request.resource.data.content is string
        && request.resource.data.content.size() > 0
        && request.resource.data.content.size() < 20000;
      allow update, delete: if request.auth != null
        && resource.data.authorId == request.auth.uid;
    }
  }
}
```

These rules mean: anyone can read posts (it's a public blog), but only a
signed-in user can create a post under their own account, and only the
original author can edit or delete their own post. If you (the founders)
want the ability to remove someone else's post for moderation, add an
`admins` check to the `update, delete` rule keyed off `request.auth.token.email`.

That's it — no build step, no server to deploy. Once the config and rules
are in place, `signup.html` creates real accounts and `dashboard.html` /
`blog.html` read and write real posts.

Posts also carry a `category` (Firmware, Edge AI, Wireless, Boards, Tools,
Other) used for the filter pills on `blog.html`. It's not enforced by the
rules above — any non-empty string is accepted — so no changes are needed
there unless you want to lock it down further.

## Shop & payments setup (Razorpay + Firebase Functions)

`shop.html` / `checkout.html` sell physical goods (dev boards, modules, kits)
and bookable consulting packages. Unlike the blog, this needs a small
server-side piece: a static site can display a catalog on its own, but it
can't safely compute a price total or confirm a payment actually went
through — that has to happen somewhere the customer's browser can't tamper
with it. That's what `functions/` (Firebase Cloud Functions) is for.

Until this is set up, `checkout.html` shows a "checkout isn't live yet"
notice and the Pay button stays disabled — same pattern as the blog before
Firebase is connected.

**What you need first:**
- A [Razorpay](https://razorpay.com) account (test mode is fine to start).
- The Firebase project from the blog setup above, upgraded to the **Blaze**
  (pay-as-you-go) plan — Cloud Functions require it. The free tier is
  generous (2M invocations/month) but Blaze needs a card on file.
- The [Firebase CLI](https://firebase.google.com/docs/cli) installed
  (`npm install -g firebase-tools`), logged in (`firebase login`).

**Setup:**

1. In the Firebase console, **Upgrade** the project to Blaze (Settings → Usage and billing).
2. In the Razorpay dashboard → **Settings → API Keys**, generate a Key ID and Key Secret (use the **Test** keys while you're setting this up).
3. From the repo root: `firebase use --add` and pick your Firebase project.
4. Set the Razorpay Key ID as a deploy-time param and the Key Secret as a secret (the secret is never stored in this repo):
   ```
   firebase functions:secrets:set RAZORPAY_KEY_SECRET
   ```
   and when prompted for `RAZORPAY_KEY_ID`, either export it as an env var before deploying or add a `functions/.env` file (already git-ignored) containing:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   ```
5. Install dependencies and deploy: `cd functions && npm install && cd .. && firebase deploy --only functions`.
6. Put the **public** Key ID (safe to expose client-side — the secret never goes here) into `js/firebase-config.js`:
   ```js
   window.RAZORPAY_KEY_ID = "rzp_test_xxxxxxxxxxxx";
   ```
7. In **Firestore → Rules**, add the `orders` collection to the existing rules:
   ```
   match /orders/{orderId} {
     allow read, write: if false;
   }
   ```
   Orders are only ever written by the Cloud Functions using the Admin SDK
   (which bypasses these rules entirely), so `false` here correctly blocks
   any direct client tampering — the client never reads order docs either;
   the confirmation on `order-success.html` comes from the function's
   response, not a Firestore read.
8. Test a full checkout with a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/) before switching to live keys (repeat steps 2–6 with your live Key ID/Secret when ready).

**Two places for prices.** There's no build step tying the static frontend
to the Functions deploy, so the catalog exists in two files:
`js/products.js` (what's displayed in the shop) and `functions/products.js`
(the authoritative list `createOrder` actually charges against). If you
add a product or change a price, update **both** — a mismatch means the
shop displays one price but charges another.

## Local blog posts (Markdown, no Firebase needed)

Alongside the Firebase-backed community blog, `blog.html` also shows a set of
file-based guides written by the team — these need no database and work even
before Firebase is connected. They live in `blog-posts/<slug>/index.md`,
listed in `js/blog-posts.js`, and are read full-length on `post.html?slug=<slug>`.

**To add a new one:**

1. Make a folder `blog-posts/<slug>/` with an `index.md` (plain Markdown —
   GitHub-flavored: tables, fenced code, images all work) and an `images/`
   subfolder for anything it references. Use relative paths like
   `images/diagram.png` inside the post — `post.html` resolves them against
   the post's own folder automatically. Add a `files/` subfolder the same way
   for downloadable attachments (PDFs, source code).
2. Add one entry to the `LOCAL_POSTS` array in `js/blog-posts.js` (slug,
   title, category — reuse one of `POST_CATEGORIES` in `js/posts.js`, or add
   a new one there — date, author, a one-sentence summary, and the path to
   `index.md`).
3. That's it — `blog.html`'s list, search and category filters, and the
   homepage's blog preview, all read from that same manifest.

**Or use `tools/add_blog.py`** to do all of the above from a source `.md`
file (e.g. a post written in a separate working folder, TechBlogs-style):

```
python3 tools/add_blog.py \
  --source /path/to/your/post.md \
  --slug my-new-post \
  --category Firmware \
  --summary "One or two sentences for the blog card." \
  [--title "..."] [--author "..."] [--date YYYY-MM-DD] \
  [--images-dir /path/to/images] [--attach /path/to/file.c ...] \
  [--keep-badges] [--force] [--dry-run]
```

It copies every image the post references into `blog-posts/<slug>/images/`
and rewrites the paths, rewrites cross-links to other posts already in the
manifest (`[...](other_post.md)` → `post.html?slug=other-post`), strips
GitHub-repo badge clutter (follow/view-counter/commit badges) unless
`--keep-badges` is passed, adds a new `POST_CATEGORIES` entry if the category
is new, and writes (or updates, with `--force`) the entry in
`js/blog-posts.js` plus a `sitemap.xml` entry. It does **not** auto-attach
non-image files (PDFs, source code) it finds linked in the post — it warns
about them instead, so you decide via `--attach` whether each one belongs on
the site. **Always run with `--dry-run` first** to preview every change
before anything is written, and check the diff afterward — title/summary
extraction and cross-link guessing are heuristics, not guaranteed correct.

## WhatsApp button

Every page shows a floating WhatsApp button (bottom-left) plus a link in
the homepage contact section and footer, all pointing at the link in
`window.WHATSAPP_LINK` at the top of `js/whatsapp.js`. To change the
destination (e.g. swap the channel for a support number or group), edit
that one line — the footer's `mailto`-style hardcoded copy in
`index.html` should be updated to match if you do.
