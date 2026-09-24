/* =========================================================
   GROVE — Cart & Wishlist store
   Persists to localStorage. Framework-free pub/sub: any module
   can call cart.subscribe() to re-render when state changes.
   ========================================================= */

import { getProductById } from "./mockData.js";

const CART_KEY = "grove:cart";
const WISHLIST_KEY = "grove:wishlist";
const TAX_RATE = 0.075;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FLAT = 8;

const PROMO_CODES = {
  GROVE10: { type: "percent", value: 10 },
  WELCOME15: { type: "percent", value: 15 },
  FREESHIP: { type: "shipping", value: 0 },
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota) — fail silently */
  }
}

/** @type {{lines: {productId:string,color:string,size:string,qty:number}[], promo:string|null}} */
let cartState = readJSON(CART_KEY, { lines: [], promo: null });
/** @type {string[]} */
let wishlistState = readJSON(WISHLIST_KEY, []);

const listeners = new Set();
function emit() {
  listeners.forEach((fn) => fn());
}
function persist() {
  writeJSON(CART_KEY, cartState);
  writeJSON(WISHLIST_KEY, wishlistState);
  emit();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function lineKey(productId, color, size) {
  return `${productId}__${color || ""}__${size || ""}`;
}

/* ---------------- Cart mutations ---------------- */
export function addToCart(productId, { color = "", size = "", qty = 1 } = {}) {
  const product = getProductById(productId);
  if (!product || product.stock <= 0) return { ok: false, message: "This item is sold out." };
  const key = lineKey(productId, color, size);
  const existing = cartState.lines.find((l) => lineKey(l.productId, l.color, l.size) === key);
  const nextQty = (existing?.qty || 0) + qty;
  if (nextQty > product.stock) return { ok: false, message: `Only ${product.stock} available.` };
  if (existing) existing.qty = nextQty;
  else cartState.lines.push({ productId, color, size, qty });
  persist();
  return { ok: true };
}

export function updateQty(productId, color, size, qty) {
  const key = lineKey(productId, color, size);
  const line = cartState.lines.find((l) => lineKey(l.productId, l.color, l.size) === key);
  if (!line) return { ok: false };
  const product = getProductById(productId);
  if (!product || product.stock <= 0) {
    removeFromCart(productId, color, size);
    return { ok: false, message: "This item is sold out." };
  }
  line.qty = Math.min(product.stock, Math.max(1, qty));
  persist();
  return { ok: true, qty: line.qty };
}

export function removeFromCart(productId, color, size) {
  const key = lineKey(productId, color, size);
  cartState.lines = cartState.lines.filter((l) => lineKey(l.productId, l.color, l.size) !== key);
  persist();
}

export function clearCart() {
  cartState.lines = [];
  cartState.promo = null;
  persist();
}

export function applyPromo(code) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) return { ok: false, message: "Enter a code to apply." };
  if (!PROMO_CODES[normalized]) return { ok: false, message: "That code isn't valid." };
  cartState.promo = normalized;
  persist();
  return { ok: true, message: `“${normalized}” applied.` };
}

export function removePromo() {
  cartState.promo = null;
  persist();
}

/* ---------------- Wishlist mutations ---------------- */
export function toggleWishlist(productId) {
  const idx = wishlistState.indexOf(productId);
  if (idx > -1) wishlistState.splice(idx, 1);
  else wishlistState.push(productId);
  persist();
  return isWishlisted(productId);
}
export function isWishlisted(productId) {
  return wishlistState.includes(productId);
}
export function getWishlist() {
  return wishlistState.map(getProductById).filter(Boolean);
}

/* ---------------- Derived state ---------------- */
export function getCartLines() {
  return cartState.lines
    .map((line) => ({ ...line, product: getProductById(line.productId) }))
    .filter((line) => line.product);
}

export function getCartCount() {
  return cartState.lines.reduce((sum, l) => sum + l.qty, 0);
}

export function getWishlistCount() {
  return wishlistState.length;
}

export function getCartTotals() {
  const lines = getCartLines();
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  let discount = 0;
  let shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const promo = cartState.promo ? PROMO_CODES[cartState.promo] : null;

  if (promo) {
    if (promo.type === "percent") discount = subtotal * (promo.value / 100);
    if (promo.type === "shipping") shipping = 0;
  }

  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * TAX_RATE;
  const total = taxable + tax + shipping;

  return {
    subtotal, discount, shipping, tax, total,
    promoCode: cartState.promo,
    freeShippingRemaining: Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0),
  };
}

export const money = (n) => `$${n.toFixed(2)}`;
