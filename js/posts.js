import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { initFirebase } from "./auth.js";

const MAX_TITLE = 200;
const MAX_CONTENT = 20000;
export const POST_CATEGORIES = ["Firmware", "Edge AI", "Wireless", "Boards", "Tools", "Other"];

export function validatePost(title, content){
  title = (title || '').trim();
  content = (content || '').trim();
  if(!title) return "Please add a title.";
  if(title.length > MAX_TITLE) return "Title is too long (max " + MAX_TITLE + " characters).";
  if(!content) return "Please write something in the post body.";
  if(content.length > MAX_CONTENT) return "Post is too long (max " + MAX_CONTENT + " characters).";
  return null;
}

export async function createPost(uid, authorName, title, content, category){
  const { db } = initFirebase();
  return addDoc(collection(db, "posts"), {
    title: title.trim(),
    content: content.trim(),
    category: POST_CATEGORIES.indexOf(category) !== -1 ? category : "Other",
    authorId: uid,
    authorName: authorName || "Anonymous",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updatePost(postId, title, content, category){
  const { db } = initFirebase();
  return updateDoc(doc(db, "posts", postId), {
    title: title.trim(),
    content: content.trim(),
    category: POST_CATEGORIES.indexOf(category) !== -1 ? category : "Other",
    updatedAt: serverTimestamp()
  });
}

export async function deletePost(postId){
  const { db } = initFirebase();
  return deleteDoc(doc(db, "posts", postId));
}

export async function listAllPosts(){
  const { db } = initFirebase();
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
}

export async function listPostsByAuthor(uid){
  const { db } = initFirebase();
  const q = query(collection(db, "posts"), where("authorId", "==", uid));
  const snap = await getDocs(q);
  const rows = snap.docs.map(function(d){ return Object.assign({ id: d.id }, d.data()); });
  rows.sort(function(a, b){
    var at = (a.createdAt && a.createdAt.seconds) || 0;
    var bt = (b.createdAt && b.createdAt.seconds) || 0;
    return bt - at;
  });
  return rows;
}

export function formatDate(ts){
  if(!ts || !ts.seconds) return '';
  var d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
}
