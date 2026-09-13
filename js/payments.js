import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";
import { initFirebase } from "./auth.js";

let functionsInstance;
function fns(){
  if(!functionsInstance){
    const { app } = initFirebase();
    functionsInstance = getFunctions(app);
  }
  return functionsInstance;
}

/* items: [{productId, qty}]. buyer: {name, email, phone, address?}.
   Prices are NOT trusted from the client — the createOrder function looks
   them up from functions/products.js and computes the real total. */
export async function createOrder(items, buyer){
  const call = httpsCallable(fns(), "createOrder");
  const res = await call({ items, buyer });
  return res.data; // { orderId, amount, keyId }
}

export async function verifyPayment(razorpayResponse){
  const call = httpsCallable(fns(), "verifyPayment");
  const res = await call(razorpayResponse);
  return res.data; // { ok, orderId }
}
