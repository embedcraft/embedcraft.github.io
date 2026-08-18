import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let app, auth, db;

export function initFirebase(){
  if(!app){
    app = initializeApp(window.FIREBASE_CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
}

export async function signUp(name, email, password){
  const { auth, db } = initFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    displayName: name,
    email: email,
    createdAt: serverTimestamp()
  });
  return cred.user;
}

export async function logIn(email, password){
  const { auth } = initFirebase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut(){
  const { auth } = initFirebase();
  await signOut(auth);
}

export function onAuth(cb){
  const { auth } = initFirebase();
  return onAuthStateChanged(auth, cb);
}

export function friendlyAuthError(err){
  var code = (err && err.code) || '';
  var map = {
    'auth/email-already-in-use': "That email is already registered — try signing in instead.",
    'auth/invalid-email': "That doesn't look like a valid email address.",
    'auth/weak-password': "Password should be at least 6 characters.",
    'auth/user-not-found': "No account found with that email.",
    'auth/wrong-password': "Incorrect password.",
    'auth/invalid-credential': "Incorrect email or password.",
    'auth/too-many-requests': "Too many attempts — please wait a moment and try again.",
    'auth/network-request-failed': "Network error — check your connection and try again."
  };
  return map[code] || (err && err.message) || "Something went wrong. Please try again.";
}
