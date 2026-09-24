/* =========================================================
   GROVE — Product detail page
   Gallery, variant selectors, quantity, accordion, related items.
   ========================================================= */

import { getProductById, getRelatedProducts } from "./mockData.js";
import { addToCart, isWishlisted, toggleWishlist, money } from "./cart.js";
import { renderProductGrid, showToast } from "./main.js";

function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function getIdFromURL() {
  return new URLSearchParams(location.search).get("id");
}

function renderNotFound(root) {
  root.innerHTML = `<div class="empty-state"><h3>We couldn't find that product</h3><p>It may have sold out permanently.</p><a class="btn btn--primary" href="shop.html">Back to shop</a></div>`;
}

function initGallery(product) {
  const mainImg = document.querySelector("[data-pdp-main-img]");
  const thumbWrap = document.querySelector("[data-pdp-thumbs]");
  if (!mainImg || !thumbWrap) return;

  thumbWrap.innerHTML = product.images.map((src, i) => `
    <button type="button" data-thumb="${i}" class="${i === 0 ? "is-active" : ""}" aria-label="View image ${i + 1}" aria-pressed="${i === 0 ? "true" : "false"}">
      <img src="${src}" alt="" loading="lazy" width="84" height="84">
    </button>`).join("");

  thumbWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-thumb]");
    if (!btn) return;
    const i = Number(btn.dataset.thumb);
    mainImg.src = product.images[i];
    thumbWrap.querySelectorAll("button").forEach((b, n) => {
      b.classList.toggle("is-active", n === i);
      b.setAttribute("aria-pressed", String(n === i));
    });
  });
}

function initAccordion() {
  document.querySelectorAll(".accordion-item__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion-item");
      const panel = item.querySelector(".accordion-item__panel");
      const isOpen = item.classList.toggle("is-open");
      panel.style.maxHeight = isOpen ? panel.scrollHeight + "px" : "0px";
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function renderPage(product) {
  document.title = `${product.title} — Grove`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", `${product.title} — ${product.description}`);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogTitle) ogTitle.setAttribute("content", `${product.title} — Grove`);
  if (ogDescription) ogDescription.setAttribute("content", product.description);

  document.querySelector("[data-pdp-cat]").textContent = product.category.replace("-", " ");
  document.querySelector("[data-pdp-title]").textContent = product.title;
  document.querySelector("[data-pdp-rating]").innerHTML = `<span class="rating__stars">${starString(product.rating)}</span> ${product.rating} (${product.reviewCount} reviews)`;
  document.querySelector("[data-pdp-price]").innerHTML = `${product.compareAtPrice ? `<span class="price-tag__old">${money(product.compareAtPrice)}</span> ` : ""}${money(product.price)}`;
  document.querySelector("[data-pdp-desc]").textContent = product.description;
  document.querySelector("[data-pdp-breadcrumb]").textContent = product.title;

  const specsBody = document.querySelector("[data-pdp-specs]");
  specsBody.innerHTML = Object.entries(product.specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");

  const colorRow = document.querySelector("[data-pdp-colors]");
  const colorWrap = document.querySelector("[data-pdp-color-row]");
  let selectedColor = product.colors[0] || "";
  if (product.colors.length) {
    colorRow.style.display = "";
    colorWrap.innerHTML = product.colors.map((c, i) => `<button type="button" class="swatch ${i === 0 ? "is-selected" : ""}" style="background:${c}" data-color="${c}" aria-label="Color ${c}" aria-pressed="${i === 0 ? "true" : "false"}></button>`).join("");
    colorWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".swatch");
      if (!btn) return;
      selectedColor = btn.dataset.color;
      colorWrap.querySelectorAll(".swatch").forEach((s) => {
        const selected = s === btn;
        s.classList.toggle("is-selected", selected);
        s.setAttribute("aria-pressed", String(selected));
      });
    });
  } else {
    colorRow.style.display = "none";
  }

  const sizeRow = document.querySelector("[data-pdp-sizes]");
  const sizeWrap = document.querySelector("[data-pdp-size-row]");
  let selectedSize = product.sizes.find((s) => !product.outOfStockSizes.includes(s)) || "";
  if (product.sizes.length) {
    sizeRow.style.display = "";
    sizeWrap.innerHTML = product.sizes.map((s) => {
      const out = product.outOfStockSizes.includes(s);
      return `<button type="button" class="size-chip ${s === selectedSize ? "is-selected" : ""}" data-size="${s}" aria-pressed="${s === selectedSize ? "true" : "false"}" ${out ? "disabled" : ""}>${s}</button>`;
    }).join("");
    sizeWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".size-chip");
      if (!btn || btn.disabled) return;
      selectedSize = btn.dataset.size;
      sizeWrap.querySelectorAll(".size-chip").forEach((s) => {
        const selected = s === btn;
        s.classList.toggle("is-selected", selected);
        s.setAttribute("aria-pressed", String(selected));
      });
    });
  } else {
    sizeRow.style.display = "none";
  }

  const qtyInput = document.querySelector("[data-pdp-qty-input]");
  let qty = 1;
  document.querySelectorAll("[data-pdp-qty-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      qty = Math.max(1, qty + Number(btn.dataset.pdpQtyStep));
      qtyInput.value = qty;
    });
  });

  const wishBtn = document.querySelector("[data-pdp-wishlist]");
  wishBtn.classList.toggle("is-active", isWishlisted(product.id));
  wishBtn.setAttribute("aria-pressed", String(isWishlisted(product.id)));
  wishBtn.addEventListener("click", () => {
    const active = toggleWishlist(product.id);
    wishBtn.classList.toggle("is-active", active);
    wishBtn.setAttribute("aria-pressed", String(active));
    wishBtn.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
    showToast(active ? "Added to wishlist" : "Removed from wishlist");
  });

  const addBtn = document.querySelector("[data-pdp-add]");
  addBtn.disabled = product.stock === 0;
  addBtn.textContent = product.stock === 0 ? "Sold out" : "Add to cart";
  addBtn.addEventListener("click", () => {
    const result = addToCart(product.id, { color: selectedColor, size: selectedSize, qty });
    showToast(result?.ok === false ? result.message : `${product.title} added to cart`);
    if (result?.ok !== false) document.querySelector("[data-cart-open]")?.click();
  });

  initGallery(product);
  initAccordion();
  renderProductGrid(document.querySelector("[data-related-grid]"), getRelatedProducts(product));
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-pdp-root]");
  if (!root) return;
  const product = getProductById(getIdFromURL());
  if (!product) { renderNotFound(root); return; }
  renderPage(product);
});
