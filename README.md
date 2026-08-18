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
