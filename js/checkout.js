/* =========================================================
   GROVE — Checkout flow (mock)
   Visual multi-step indicator: Shipping -> Payment -> Confirmation.
   No real payment processing — this is a template scaffold.
   ========================================================= */

import { getCartLines, getCartTotals, clearCart, money } from "./cart.js";

const steps = ["shipping", "payment", "confirmation"];
let current = 0;
let selectedPayment = "Card";

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

function updatePaymentUI() {
  const cardForm = document.querySelector("#payment-form");
  if (!cardForm) return;

  const cardFields = cardForm.querySelectorAll(".field");
  const submit = cardForm.querySelector("[data-checkout-next]");
  const existingNote = cardForm.querySelector("[data-payment-note]");
  const isCard = selectedPayment === "Card";

  cardFields.forEach((field) => {
    field.style.display = isCard ? "" : "none";
    field.querySelectorAll("input").forEach((input) => {
      input.required = isCard;
    });
  });

  if (submit) {
    submit.textContent = isCard ? "Review & place order" : `Continue with ${selectedPayment}`;
  }

  if (!isCard && !existingNote) {
    const note = document.createElement("p");
    note.dataset.paymentNote = "";
    note.style.margin = "0 0 var(--space-4)";
    note.textContent = selectedPayment === "PayPal"
      ? "This demo will simulate a secure PayPal handoff. No real payment will be processed."
      : "This demo will simulate an Apple Pay handoff. No real payment will be processed.";
    cardForm.insertBefore(note, cardForm.firstElementChild);
  } else if (isCard && existingNote) {
    existingNote.remove();
  } else if (!isCard && existingNote) {
    existingNote.textContent = selectedPayment === "PayPal"
      ? "This demo will simulate a secure PayPal handoff. No real payment will be processed."
      : "This demo will simulate an Apple Pay handoff. No real payment will be processed.";
  }
}

function initPayMethods() {
  document.querySelectorAll(".pay-method").forEach((el) => {
    el.addEventListener("click", () => {
      selectedPayment = el.textContent.trim();
      document.querySelectorAll(".pay-method").forEach((x) => {
        const selected = x === el;
        x.classList.toggle("is-selected", selected);
        x.setAttribute("aria-pressed", String(selected));
      });
      updatePaymentUI();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector("[data-checkout-steps]")) return;

  if (!getCartLines().length) {
    const emptyNotice = document.querySelector("[data-checkout-empty]");
    const checkoutGrid = document.querySelector(".checkout-grid");
    if (emptyNotice) {
      emptyNotice.style.display = "";
      emptyNotice.setAttribute("aria-hidden", "false");
    }
    if (checkoutGrid) checkoutGrid.hidden = true;
    return;
  }
  renderOrderReview();
  initPayMethods();
  updatePaymentUI();
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
