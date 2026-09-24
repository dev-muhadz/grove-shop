/* =========================================================
   GROVE — App shell
   Theme switching, mobile nav, cart drawer, toasts, and
   the product-card renderer shared by every page.
   ========================================================= */

import { PRODUCTS, getProductById } from "./mockData.js";
import {
  addToCart, removeFromCart, updateQty, getCartLines, getCartCount,
  getCartTotals, applyPromo, removePromo, toggleWishlist, isWishlisted,
  getWishlistCount, getWishlist, subscribe, money,
} from "./cart.js";

/* ---------------- Theme ---------------- */
const THEME_KEY = "grove:theme";
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll(".theme-switch button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.swatch === theme);
  });
  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) toggle.setAttribute("aria-pressed", String(theme === "dark"));
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const preferred = saved || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(preferred);

  document.querySelectorAll(".theme-switch button").forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.swatch));
  });
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

/* ---------------- Mobile nav drawer ---------------- */
function initMobileNav() {
  const nav = document.querySelector("[data-mobile-nav]");
  const overlay = document.querySelector("[data-mobile-nav-overlay]");
  const openBtn = document.querySelector("[data-nav-toggle]");
  const closeBtn = document.querySelector("[data-mobile-nav-close]");
  if (!nav || !overlay || !openBtn) return;

  let previousFocus = null;
  const getFocusable = () => [...nav.querySelectorAll("a,button,input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter((el) => !el.disabled && el.offsetParent !== null);
  const open = () => {
    previousFocus = document.activeElement;
    nav.classList.add("is-open");
    overlay.classList.add("is-open");
    document.body.classList.add("nav-open");
    openBtn.setAttribute("aria-expanded", "true");
    closeBtn?.focus();
  };
  const close = () => {
    nav.classList.remove("is-open");
    overlay.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    openBtn.setAttribute("aria-expanded", "false");
    previousFocus?.focus?.();
    previousFocus = null;
  };

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", close);
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (!nav.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const focusable = getFocusable();
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  });
}

/* ---------------- Toasts ---------------- */
function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  return stack;
}
export function showToast(message) {
  const stack = ensureToastStack();
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span class="toast__dot"></span><span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 200);
  }, 2600);
}

/* ---------------- Shared product-card markup ---------------- */
function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export function productCardHTML(p) {
  const wished = isWishlisted(p.id);
  const [main, alt] = p.images;
  return `
  <article class="product-card" data-product-id="${p.id}">
    <div class="product-card__media">
      ${p.isNew ? `<span class="product-card__badge">New</span>` : ""}
      ${p.stock === 0 ? `<span class="product-card__badge product-card__badge--out">Sold out</span>` : ""}
      <button class="product-card__wish ${wished ? "is-active" : ""}" aria-pressed="${wished}" aria-label="Toggle wishlist for ${p.title}" data-wishlist-toggle="${p.id}">
        <svg viewBox="0 0 24 24" stroke-width="1.6"><path d="M12 21s-7.5-4.9-10-9.3C.3 8 2 4 6 4c2.2 0 3.7 1.3 6 4 2.3-2.7 3.8-4 6-4 4 0 5.7 4 4 7.7-2.5 4.4-10 9.3-10 9.3z"/></svg>
      </button>
      <img class="product-card__img product-card__img--main" src="${main}" alt="${p.title}" loading="lazy" width="600" height="750">
      ${alt ? `<img class="product-card__img product-card__img--alt" src="${alt}" alt="" loading="lazy" width="600" height="750">` : ""}
      <div class="product-card__quick">
        <button class="btn btn--primary btn--sm btn--full" data-quick-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>
          ${p.stock === 0 ? "Sold out" : "Quick add"}
        </button>
      </div>
    </div>
    <div class="product-card__body">
      <div class="product-card__cat">${p.category.replace("-", " ")}</div>
      <h3 class="product-card__title"><a href="product.html?id=${p.id}">${p.title}</a></h3>
      <div class="rating"><span class="rating__stars">${starString(p.rating)}</span> (${p.reviewCount})</div>
      <div class="price-tag ${p.compareAtPrice ? "price-tag--sale" : ""}" style="margin-top:6px">
        ${p.compareAtPrice ? `<span class="price-tag__old">${money(p.compareAtPrice)}</span>` : ""}
        <span class="price-tag__new">${money(p.price)}</span>
      </div>
    </div>
  </article>`;
}

export function renderProductGrid(container, products) {
  if (!container) return;
  if (!products.length) {
    container.innerHTML = `<div class="empty-state"><h3>No products match those filters</h3><p>Try widening your search or clearing a filter.</p></div>`;
    return;
  }
  container.innerHTML = products.map(productCardHTML).join("");
}

/* ---------------- Cart drawer ---------------- */
function cartLineHTML(line) {
  const { product, color, size, qty } = line;
  const variantBits = [color ? `Color: ${color}` : "", size ? `Size: ${size}` : ""].filter(Boolean).join(" · ");
  return `
  <div class="cart-line" data-line="${product.id}|${color}|${size}">
    <div class="cart-line__img"><img src="${product.images[0]}" alt="" loading="lazy" width="72" height="88"></div>
    <div>
      <div class="cart-line__title">${product.title}</div>
      ${variantBits ? `<div class="cart-line__variant">${variantBits}</div>` : ""}
      <div class="qty-stepper" data-qty-stepper>
        <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
        <input type="text" readonly value="${qty}" aria-label="Quantity">
        <button type="button" data-step="1" aria-label="Increase quantity">+</button>
      </div>
      <button class="cart-line__remove" data-remove-line>Remove</button>
    </div>
    <div class="cart-line__price">${money(product.price * qty)}</div>
  </div>`;
}

function renderCartContents(body, footer) {
  const lines = getCartLines();
  if (!body) return;
  if (!lines.length) {
    body.innerHTML = `<div class="cart-empty"><h3>Your cart is empty</h3><p>Explore the shop to find something you'll love.</p><a class="btn btn--primary" href="shop.html">Browse the shop</a></div>`;
    if (footer) footer.innerHTML = "";
    return;
  }
  body.innerHTML = lines.map(cartLineHTML).join("");
  const totals = getCartTotals();
  if (footer) {
    footer.innerHTML = `
      ${totals.freeShippingRemaining > 0
        ? `<p class="promo-msg" style="color:var(--color-muted)">${money(totals.freeShippingRemaining)} away from free shipping</p>`
        : `<p class="promo-msg is-success">You've unlocked free shipping</p>`}
      <div class="promo-row">
        <input type="text" placeholder="Promo code" data-promo-input value="${totals.promoCode || ""}">
        <button class="btn btn--outline btn--sm" data-promo-apply>Apply</button>
      </div>
      <div id="promo-feedback"></div>
      <div class="summary-row"><span>Subtotal</span><span>${money(totals.subtotal)}</span></div>
      ${totals.discount > 0 ? `<div class="summary-row"><span>Discount</span><span>−${money(totals.discount)}</span></div>` : ""}
      <div class="summary-row"><span>Shipping</span><span>${totals.shipping === 0 ? "Free" : money(totals.shipping)}</span></div>
      <div class="summary-row"><span>Tax (est.)</span><span>${money(totals.tax)}</span></div>
      <div class="summary-row summary-row--total"><span>Total</span><span>${money(totals.total)}</span></div>
      <a href="checkout.html" class="btn btn--primary btn--full" style="margin-top:var(--space-4)">Checkout</a>
    `;
  }
}

function renderCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const body = drawer?.querySelector("[data-cart-body]");
  const footer = drawer?.querySelector("[data-cart-footer]");
  const countEls = document.querySelectorAll("[data-cart-count]");
  const wishCountEls = document.querySelectorAll("[data-wishlist-count]");
  const lines = getCartLines();
  const count = getCartCount();

  countEls.forEach((el) => { el.textContent = String(count); el.classList.toggle("is-visible", count > 0); });
  wishCountEls.forEach((el) => { const n = getWishlistCount(); el.textContent = String(n); el.classList.toggle("is-visible", n > 0); });

  renderCartContents(body, footer);
  renderCartContents(
    document.querySelector("[data-cart-page-body]"),
    document.querySelector("[data-cart-page-footer]")
  );

function initCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");
  const openBtns = document.querySelectorAll("[data-cart-open]");
  const closeBtn = document.querySelector("[data-cart-close]");
  if (!drawer) { renderCartDrawer(); return; }

  let previousFocus = null;
  const getFocusable = () => [...drawer.querySelectorAll("a,button,input,select,textarea,[tabindex]:not([tabindex='-1'])")].filter((el) => !el.disabled && el.offsetParent !== null);
  const open = () => {
    previousFocus = document.activeElement;
    drawer.classList.add("is-open");
    overlay?.classList.add("is-open");
    document.body.classList.add("cart-open");
    drawer.setAttribute("aria-hidden", "false");
    closeBtn?.focus();
  };
  const close = () => {
    drawer.classList.remove("is-open");
    overlay?.classList.remove("is-open");
    document.body.classList.remove("cart-open");
    drawer.setAttribute("aria-hidden", "true");
    previousFocus?.focus?.();
    previousFocus = null;
  };

  openBtns.forEach((btn) => btn.addEventListener("click", (e) => { e.preventDefault(); open(); }));
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const focusable = getFocusable();
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  });

  document.querySelectorAll("[data-cart-body], [data-cart-page-body]").forEach((cartBody) => cartBody.addEventListener("click", (e) => {
    const stepBtn = e.target.closest("[data-step]");
    const removeBtn = e.target.closest("[data-remove-line]");
    const lineEl = e.target.closest("[data-line]");
    if (!lineEl) return;
    const [productId, color, size] = lineEl.dataset.line.split("|");

    if (stepBtn) {
      const current = getCartLines().find((l) => l.productId === productId && l.color === color && l.size === size);
      if (current) updateQty(productId, color, size, current.qty + Number(stepBtn.dataset.step));
    }
    if (removeBtn) removeFromCart(productId, color, size);
  }));

  document.body.addEventListener("click", (e) => {
    const applyBtn = e.target.closest("[data-promo-apply]");
    if (!applyBtn) return;
    const input = document.querySelector("[data-promo-input]");
    const result = applyPromo(input?.value || "");
    const feedback = document.getElementById("promo-feedback");
    if (feedback) feedback.innerHTML = `<p class="promo-msg ${result.ok ? "is-success" : "is-error"}">${result.message}</p>`;
  });

  renderCartDrawer();
}

/* ---------------- Global add-to-cart / wishlist click delegation ---------------- */
function initGlobalActions() {
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-quick-add]");
    const wishBtn = e.target.closest("[data-wishlist-toggle]");

    if (addBtn) {
      e.preventDefault();
      const product = getProductById(addBtn.dataset.quickAdd);
      if (!product) return;
      const result = addToCart(product.id, { color: product.colors[0] || "", size: product.sizes[0] || "", qty: 1 });
      showToast(result?.ok === false ? result.message : `${product.title} added to cart`);
      if (result?.ok !== false) document.querySelector("[data-cart-open]")?.click();
    }

    if (wishBtn) {
      e.preventDefault();
      const id = wishBtn.dataset.wishlistToggle;
      const product = getProductById(id);
      const nowActive = toggleWishlist(id);
      wishBtn.classList.toggle("is-active", nowActive);
      wishBtn.setAttribute("aria-pressed", String(nowActive));
      showToast(nowActive ? `${product?.title || "Item"} added to wishlist` : `Removed from wishlist`);
    }
  });
}

/* ---------------- Hero slider ---------------- */
function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dotsWrap = document.querySelector("[data-hero-dots]");
  if (!slides.length) return;
  let index = 0;
  let timer;
  let paused = false;

  if (dotsWrap) {
    dotsWrap.innerHTML = Array.from(slides, (_, i) => `<button aria-label="Go to slide ${i + 1}" data-dot="${i}"></button>`).join("");
  }
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll("button")] : [];

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
    dots.forEach((d, n) => d.classList.toggle("is-active", n === index));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => { if (!paused) show(index + 1); }, 5500);
  }
  const slider = document.querySelector(".hero-slider");
  slider?.addEventListener("mouseenter", () => { paused = true; });
  slider?.addEventListener("mouseleave", () => { paused = false; });
  slider?.addEventListener("focusin", () => { paused = true; });
  slider?.addEventListener("focusout", (e) => {
    if (!slider.contains(e.relatedTarget)) paused = false;
  });

  document.querySelector("[data-hero-prev]")?.addEventListener("click", () => { show(index - 1); restart(); });
  document.querySelector("[data-hero-next]")?.addEventListener("click", () => { show(index + 1); restart(); });
  dots.forEach((d) => d.addEventListener("click", () => { show(Number(d.dataset.dot)); restart(); }));

  show(0);
  restart();
}

/* ---------------- Home page renders ---------------- */
function initHomePage() {
  const topSelling = document.querySelector("[data-top-selling]");
  if (topSelling) {
    const best = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 8);
    renderProductGrid(topSelling, best);
  }
  const categoryGrid = document.querySelector("[data-category-grid]");
  // Category cards are static in HTML for this template; left dynamic for customization.
  void categoryGrid;

  document.querySelector("[data-newsletter-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("You're on the list — welcome to Grove.");
    e.target.reset();
  });
}

/* ---------------- Wishlist page ---------------- */
function renderWishlistPage() {
  const grid = document.querySelector("[data-wishlist-grid]");
  if (!grid) return;
  const items = getWishlist();
  const empty = document.querySelector("[data-wishlist-empty]");
  if (empty) empty.style.display = items.length ? "none" : "";
  renderProductGrid(grid, items);
}

/* ---------------- Boot ---------------- */
function setActiveNavLink() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-primary a, .mobile-nav a").forEach((a) => {
    if (a.getAttribute("href") === page) a.setAttribute("aria-current", "page");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileNav();
  initCartDrawer();
  initGlobalActions();
  initHeroSlider();
  initHomePage();
  renderWishlistPage();
  setActiveNavLink();
  subscribe(renderCartDrawer);
  subscribe(renderWishlistPage);
});
