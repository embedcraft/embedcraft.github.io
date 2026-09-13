const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { PRODUCTS } = require("./products");

initializeApp();
const db = getFirestore();

const RAZORPAY_KEY_ID = defineString("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");

const MAX_QTY_PER_ITEM = 20;

/*
  createOrder({ items: [{productId, qty}], buyer: {name, email, phone, address} })
  -> { orderId, amount, keyId }

  Computes the total from the authoritative PRODUCTS map (never the
  client-sent price), creates a Razorpay order, and writes a pending
  "orders/{orderId}" doc via the Admin SDK (Firestore rules block direct
  client writes to that collection — see README.md).
*/
exports.createOrder = onCall({ secrets: [RAZORPAY_KEY_SECRET] }, async (request) => {
  const { items, buyer } = request.data || {};

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError("invalid-argument", "Cart is empty.");
  }
  if (!buyer || !buyer.name || !buyer.email || !buyer.phone) {
    throw new HttpsError("invalid-argument", "Missing buyer details.");
  }

  let amount = 0;
  const lineItems = [];
  let hasPhysical = false;

  for (const item of items) {
    const product = PRODUCTS[item.productId];
    const qty = Number(item.qty);
    if (!product) throw new HttpsError("invalid-argument", "Unknown product: " + item.productId);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      throw new HttpsError("invalid-argument", "Invalid quantity for " + item.productId);
    }
    amount += product.price * qty;
    lineItems.push({ productId: item.productId, name: product.name, price: product.price, qty });
    if (item.productId !== "consult-1hr" && item.productId !== "sprint-5hr" && item.productId !== "retainer-weekly") {
      hasPhysical = true;
    }
  }

  if (hasPhysical && !buyer.address) {
    throw new HttpsError("invalid-argument", "Shipping address required for physical items.");
  }

  const amountPaise = amount * 100;
  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID.value(),
    key_secret: RAZORPAY_KEY_SECRET.value()
  });

  const rzpOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: "de_" + Date.now(),
    notes: { email: buyer.email }
  });

  await db.collection("orders").doc(rzpOrder.id).set({
    status: "created",
    items: lineItems,
    amount,
    buyer,
    createdAt: FieldValue.serverTimestamp()
  });

  return { orderId: rzpOrder.id, amount: amountPaise, keyId: RAZORPAY_KEY_ID.value() };
});

/*
  verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
  -> { ok, orderId }

  Recomputes the HMAC-SHA256 signature Razorpay sends back and only marks
  the order "paid" if it matches — this is what actually confirms the
  charge went through, the client-side success callback alone can't be
  trusted.
*/
exports.verifyPayment = onCall({ secrets: [RAZORPAY_KEY_SECRET] }, async (request) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.data || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new HttpsError("invalid-argument", "Missing payment details.");
  }

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET.value())
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  const orderRef = db.collection("orders").doc(razorpay_order_id);

  if (expected !== razorpay_signature) {
    await orderRef.update({ status: "failed", failedAt: FieldValue.serverTimestamp() });
    return { ok: false, orderId: razorpay_order_id };
  }

  await orderRef.update({
    status: "paid",
    paymentId: razorpay_payment_id,
    paidAt: FieldValue.serverTimestamp()
  });
  return { ok: true, orderId: razorpay_order_id };
});
