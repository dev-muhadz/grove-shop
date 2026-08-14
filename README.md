# Grove — Vanilla E-Commerce Storefront Template

A modern, dependency-free e-commerce front end built with plain HTML5, CSS3
and ES6+ JavaScript. No React, no Vue, no Tailwind, no build step required.

## Quick start

Because the JavaScript uses native ES Modules, most browsers block `fetch`
and module imports over the `file://` protocol. Serve the folder with any
static server:

```bash
# Option A — Node
npx serve .

# Option B — Python
python3 -m http.server 8080

# Option C — VS Code
Right-click index.html → "Open with Live Server"
```

Then open the printed local URL (e.g. `http://localhost:8080`).

## File structure

```
grove/
├── index.html          Home: hero slider, categories, top selling, newsletter
├── shop.html            Catalog: live filters, search, sort
├── product.html         Product detail: gallery, variants, accordion, related
├── cart.html             Full-page cart (mirrors the cart drawer)
├── checkout.html        3-step mock checkout: Shipping → Payment → Confirmation
├── wishlist.html         Saved items page
├── css/
│   ├── variables.css     Design tokens + 3 switchable themes
│   ├── style.css          Reset, typography, header/footer/layout
│   └── components.css    Every UI component (cards, drawer, forms, etc.)
├── js/
│   ├── mockData.js        Product & category data — swap for a real API
│   ├── cart.js              Cart + wishlist state, localStorage, totals
│   ├── main.js              App shell: theme, nav, drawer, toasts, home page
│   ├── filter.js             Shop page: search / filter / sort logic
│   ├── product.js           Product detail page logic
│   └── checkout.js          Mock multi-step checkout logic
└── assets/                Icons are inline SVG; images load from picsum.photos
                            placeholders — replace with your own product photos.
```

## Customizing the theme

All colors, type and spacing live in `css/variables.css` as CSS custom
properties, scoped under three `[data-theme]` presets:

- `light` — Grove Minimalist Light (default)
- `dark` — Sleek Dark
- `neo` — Vibrant Neo

Switch the whole site's palette by changing `data-theme` on `<html>`, or let
shoppers pick via the swatch buttons in the header (already wired up in
`main.js`, persisted to `localStorage`). To add a fourth theme, copy one of
the `[data-theme="..."]` blocks and add a matching swatch button.

## Swapping in real data

Replace the contents of `js/mockData.js` with a `fetch()` call to your API —
every other module (`cart.js`, `main.js`, `filter.js`, `product.js`) only
depends on the `Product`/`Category` shapes documented at the top of that
file, so nothing else needs to change.

## Notes for buyers

- Cart and wishlist persist per-browser via `localStorage` — there is no
  backend. Wire `cart.js`'s functions up to real endpoints when you're ready.
- The checkout flow is a **visual mock**: it validates the forms but does not
  process payment. Swap `checkout.js`'s final step for a real payment
  provider integration.
- Promo codes `GROVE10`, `WELCOME15`, and `FREESHIP` are hard-coded in
  `cart.js` for demo purposes.
- Built to WCAG-friendly basics: semantic landmarks, skip link, visible focus
  states, `aria-*` on interactive controls, and `prefers-reduced-motion`
  support.
