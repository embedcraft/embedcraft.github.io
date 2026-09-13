/*
  Firebase project config.

  This site's blog + accounts (login.html, signup.html, dashboard.html, blog.html)
  need a real Firebase project to work. Steps:

  1. Go to https://console.firebase.google.com -> Add project (free Spark plan is enough).
  2. Project settings -> General -> "Your apps" -> Add app -> Web (</>) -> register it.
     Firebase will show you a config object — copy its values into FIREBASE_CONFIG below.
  3. Build > Authentication -> Get started -> enable the "Email/Password" sign-in provider.
  4. Build > Firestore Database -> Create database -> start in production mode.
  5. In Firestore -> Rules, paste the rules from README.md ("Blog & accounts setup")
     and click Publish.

  Until you fill in real values below, signup/login/blog posting will show a
  configuration error instead of silently pretending to work.
*/
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

window.FIREBASE_CONFIGURED = window.FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

/*
  Razorpay public key (Key ID only — never put the Key Secret here, it
  belongs server-side in Cloud Functions config, see functions/ and
  README.md "Shop & payments setup").

  Get this from the Razorpay dashboard -> Settings -> API Keys, after
  deploying functions/ (createOrder, verifyPayment). Until it's filled in,
  shop.html / checkout.html show a "checkout isn't live yet" notice.
*/
window.RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID";
window.RAZORPAY_CONFIGURED = window.RAZORPAY_KEY_ID !== "YOUR_RAZORPAY_KEY_ID";
