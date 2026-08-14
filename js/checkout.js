/* =========================================================
   GROVE — Checkout flow (mock)
   Visual multi-step indicator: Shipping -> Payment -> Confirmation.
   No real payment processing — this is a template scaffold.
   ========================================================= */

import { getCartLines, getCartTotals, clearCart, money } from "./cart.js";

const steps = ["shipping", "payment", "confirmation"];
let current = 0;

function renderStepper() {
  const wrap = document.querySelector("[data-checkout-steps]");
  if (!wrap) return;
  wrap.innerHTML = steps.map((s, i) => `
    <span class="checkout-step ${i === current ? "is-active" : ""} ${i < current ? "is-done" : ""}">
      <span class="checkout-step__dot">${i < current ? "✓" : i + 1}</span>
      ${s[0].toUpperCase() + s.slice(1)}
    </span>
    ${i < steps.length - 1 ? '<span class="checkout-connector"></span>' : ""}
  `).join("");
}

function showPanel() {
  steps.forEach((s, i) => {
    const panel = document.querySelector(`[data-panel="${s}"]`);
    if (panel) panel.style.display = i === current ? "" : "none";
  });
  renderStepper();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderOrderReview() {
  const wrap = document.querySelector("[data-order-review]");
  if (!wrap) return;
  const lines = getCartLines();
  const totals = getCartTotals();
  wrap.innerHTML = `
    ${lines.map((l) => `
      <div class="summary-row"><span>${l.product.title} × ${l.qty}</span><span>${money(l.product.price * l.qty)}</span></div>
    `).join("")}
    <div class="summary-row" style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px dashed var(--color-line)"><span>Subtotal</span><span>${money(totals.subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${totals.shipping === 0 ? "Free" : money(totals.shipping)}</span></div>
    <div class="summary-row"><span>Tax</span><span>${money(totals.tax)}</span></div>
    <div class="summary-row summary-row--total"><span>Total</span><span>${money(totals.total)}</span></div>
  `;
}

function initPayMethods() {
  document.querySelectorAll(".pay-method").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".pay-method").forEach((x) => x.classList.remove("is-selected"));
      el.classList.add("is-selected");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector("[data-checkout-steps]")) return;

  if (!getCartLines().length) {
    const emptyNotice = document.querySelector("[data-checkout-empty]");
    if (emptyNotice) emptyNotice.style.display = "";
  }

  renderOrderReview();
  initPayMethods();
  showPanel();

  document.querySelectorAll("[data-checkout-next]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const form = btn.closest("form");
      if (form && !form.reportValidity()) return;
      current = Math.min(current + 1, steps.length - 1);
      if (steps[current] === "confirmation") {
        const orderNumberEl = document.querySelector("[data-order-number]");
        if (orderNumberEl) orderNumberEl.textContent = `#GR-${Math.floor(10000 + Math.random() * 89999)}`;
        clearCart();
      }
      showPanel();
    });
  });

  document.querySelectorAll("[data-checkout-back]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      current = Math.max(current - 1, 0);
      showPanel();
    });
  });
});
