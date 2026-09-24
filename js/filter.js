/* =========================================================
   GROVE — Shop page: live filters, search, sort
   Pure client-side filtering over the mock catalog.
   ========================================================= */

import { PRODUCTS, CATEGORIES, getPriceBounds } from "./mockData.js";
import { renderProductGrid } from "./main.js";

const bounds = getPriceBounds();
const state = {
  query: "",
  categories: new Set(),
  maxPrice: bounds.max,
  sort: "featured",
  availability: "all",
};

function readCategoryFromURL() {
  const params = new URLSearchParams(location.search);
  const cat = params.get("category");
  if (cat) state.categories.add(cat);
}

function applyFilters() {
  let items = PRODUCTS.filter((p) => {
    const matchesQuery = state.query
      ? (p.title + " " + p.category).toLowerCase().includes(state.query.toLowerCase())
      : true;
    const matchesCategory = state.categories.size ? state.categories.has(p.category) : true;
    const matchesPrice = p.price <= state.maxPrice;
    const matchesAvailability =
      state.availability === "all" ||
      (state.availability === "in-stock" ? p.stock > 0 : p.stock === 0);
    return matchesQuery && matchesCategory && matchesPrice && matchesAvailability;
  });

  switch (state.sort) {
    case "price-asc": items.sort((a, b) => a.price - b.price); break;
    case "price-desc": items.sort((a, b) => b.price - a.price); break;
    case "rating": items.sort((a, b) => b.rating - a.rating); break;
    case "newest": items.sort((a, b) => Number(b.isNew) - Number(a.isNew)); break;
    default: break; // featured = catalog order
  }
  return items;
}

function renderChips() {
  const wrap = document.querySelector("[data-active-filters]");
  if (!wrap) return;
  const chips = [];
  state.categories.forEach((c) => chips.push({ label: CATEGORIES.find((x) => x.id === c)?.name || c, clear: () => state.categories.delete(c) }));
  if (state.maxPrice < bounds.max) chips.push({ label: `Under $${state.maxPrice}`, clear: () => { state.maxPrice = bounds.max; } });
  if (state.query) chips.push({ label: `“${state.query}”`, clear: () => { state.query = ""; const input = document.querySelector("[data-search-input]"); if (input) input.value = ""; } });

  wrap.innerHTML = chips.map((c, i) => `<span class="filter-chip" data-chip="${i}">${c.label}<button aria-label="Remove filter">×</button></span>`).join("");
  wrap.querySelectorAll(".filter-chip button").forEach((btn, i) => {
    btn.addEventListener("click", () => { chips[i].clear(); sync(); });
  });
}

function sync() {
  const results = applyFilters();
  const grid = document.querySelector("[data-shop-grid]");
  renderProductGrid(grid, results);
  const countEl = document.querySelector("[data-result-count]");
  if (countEl) countEl.textContent = `${results.length} product${results.length === 1 ? "" : "s"}`;
  renderChips();

  // reflect checkbox state (needed after chip-clear)
  document.querySelectorAll("[data-category-checkbox]").forEach((cb) => {
    cb.checked = state.categories.has(cb.value);
  });
  const range = document.querySelector("[data-price-range]");
  if (range) range.value = state.maxPrice;
  document.querySelectorAll("[data-availability]").forEach((cb) => {
    cb.checked = cb.value === state.availability;
  });
  const priceLabel = document.querySelector("[data-price-max-label]");
  if (priceLabel) priceLabel.textContent = `$${state.maxPrice}`;
}

function initCategoryCheckboxes() {
  const wrap = document.querySelector("[data-category-list]");
  if (!wrap) return;
  const counts = CATEGORIES.map((c) => ({ ...c, count: PRODUCTS.filter((p) => p.category === c.id).length }));
  wrap.innerHTML = counts.map((c) => `
    <label class="checkbox-row">
      <input type="checkbox" data-category-checkbox value="${c.id}" ${state.categories.has(c.id) ? "checked" : ""}>
      ${c.name}
      <span class="count">${c.count}</span>
    </label>`).join("");

  wrap.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-category-checkbox]");
    if (!cb) return;
    if (cb.checked) state.categories.add(cb.value);
    else state.categories.delete(cb.value);
    sync();
  });
}

function initPriceRange() {
  const range = document.querySelector("[data-price-range]");
  if (!range) return;
  range.min = bounds.min;
  range.max = bounds.max;
  range.value = state.maxPrice;
  range.addEventListener("input", () => {
    state.maxPrice = Number(range.value);
    sync();
  });
}

function initSearch() {
  const input = document.querySelector("[data-search-input]");
  if (!input) return;
  input.addEventListener("input", () => {
    state.query = input.value;
    sync();
  });
}

function initAvailability() {
  document.querySelectorAll("[data-availability]").forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) state.availability = cb.value;
      sync();
    });
  });
}

function initSort() {
  const select = document.querySelector("[data-sort-select]");
  if (!select) return;
  select.addEventListener("change", () => {
    state.sort = select.value;
    sync();
  });
}

function initCollapsibleGroups() {
  document.querySelectorAll(".filter-group__title").forEach((title) => {
    title.addEventListener("click", () => title.closest(".filter-group").classList.toggle("is-collapsed"));
  });
}

function initClearAll() {
  document.querySelector("[data-clear-filters]")?.addEventListener("click", () => {
    state.categories.clear();
    state.maxPrice = bounds.max;
    state.query = "";
    state.sort = "featured";
    state.availability = "all";
    const input = document.querySelector("[data-search-input]");
    if (input) input.value = "";
    const select = document.querySelector("[data-sort-select]");
    if (select) select.value = "featured";
    sync();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector("[data-shop-grid]")) return; // shop page only
  readCategoryFromURL();
  initCategoryCheckboxes();
  initPriceRange();
  initSearch();
  initSort();
  initAvailability();
  initCollapsibleGroups();
  initClearAll();
  sync();
});
