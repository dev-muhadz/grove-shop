/* =========================================================
   GROVE — Mock data layer
   Central source of truth for the storefront demo.
   Swap this file for a real Fetch API call to your backend —
   every module below only depends on the shapes exported here.
   ========================================================= */

export const CATEGORIES = [
  { id: "kitchen", name: "Kitchen & Table", image: "images/products/p-001.svg" },
  { id: "textiles", name: "Textiles", image: "images/products/p-002.svg" },
  { id: "lighting", name: "Lighting", image: "images/products/p-003.svg" },
  { id: "outdoor", name: "Garden & Outdoor", image: "images/products/p-012.svg" },
];

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {number} price
 * @property {number|null} compareAtPrice
 * @property {number} rating
 * @property {number} reviewCount
 * @property {string[]} images
 * @property {string[]} colors
 * @property {string[]} sizes
 * @property {string[]} outOfStockSizes
 * @property {string} description
 * @property {Object} specs
 * @property {boolean} isNew
 * @property {number} stock
 */

const PRODUCT_IMAGE_BY_SEED = {
  pourover: ["images/products/p-001.svg", "images/products/p-001-alt.svg"],
  linen: ["images/products/p-002.svg", "images/products/p-002-alt.svg"],
  lamp: ["images/products/p-003.svg", "images/products/p-003-alt.svg"],
  planter: ["images/products/p-004.svg", "images/products/p-004-alt.svg"],
  dinner: ["images/products/p-005.svg", "images/products/p-005-alt.svg"],
  throw: ["images/products/p-006.svg", "images/products/p-006-alt.svg"],
  pendant: ["images/products/p-007.svg", "images/products/p-007-alt.svg"],
  chair: ["images/products/p-008.svg", "images/products/p-008-alt.svg"],
  napkin: ["images/products/p-009.svg", "images/products/p-009-alt.svg"],
  skillet: ["images/products/p-010.svg", "images/products/p-010-alt.svg"],
  shade: ["images/products/p-011.svg", "images/products/p-011-alt.svg"],
  table: ["images/products/p-012.svg", "images/products/p-012-alt.svg"],
};

const img = (seed) => {
  const image = PRODUCT_IMAGE_BY_SEED[seed];
  return image || [];
};

/** @type {Product[]} */
export const PRODUCTS = [
  {
    id: "p-001", title: "Kanso Ceramic Pour-Over Set", category: "kitchen",
    price: 68, compareAtPrice: 82, rating: 4.8, reviewCount: 214,
    images: img("pourover", 4), colors: ["#E7E2D6", "#3E4136", "#A8813F"], sizes: [],
    outOfStockSizes: [], isNew: true, stock: 24,
    description: "A hand-glazed stoneware dripper and carafe set, thrown in small batches. Slow-poured coffee, the way it was meant to be.",
    specs: { Material: "Stoneware ceramic", Capacity: "600ml carafe", Care: "Hand wash recommended", Origin: "Made in Portugal" },
  },
  {
    id: "p-002", title: "Linden Linen Bedding Bundle", category: "textiles",
    price: 149, compareAtPrice: null, rating: 4.9, reviewCount: 388,
    images: img("linen", 4), colors: ["#EDEBE2", "#3E4136", "#A5402A", "#726F63"], sizes: ["Twin", "Queen", "King"],
    outOfStockSizes: ["Twin"], isNew: false, stock: 41,
    description: "Stone-washed European flax linen, garment-dyed for a lived-in softness that only improves with every wash.",
    specs: { Material: "100% French flax linen", "Thread weight": "205 gsm", Care: "Machine wash cold", Origin: "Made in Portugal" },
  },
  {
    id: "p-003", title: "Arc Table Lamp", category: "lighting",
    price: 118, compareAtPrice: 140, rating: 4.6, reviewCount: 97,
    images: img("lamp", 3), colors: ["#191C15", "#A8813F"], sizes: [],
    outOfStockSizes: [], isNew: false, stock: 12,
    description: "A brushed-brass task lamp with a hand-blown opal glass shade, dimmable and dressed in a fabric-braided cord.",
    specs: { Material: "Brass, opal glass", Bulb: "E26, dimmable", Cord: "6ft braided", Origin: "Made in Denmark" },
  },
  {
    id: "p-004", title: "Bramble Rattan Planter", category: "outdoor",
    price: 54, compareAtPrice: null, rating: 4.7, reviewCount: 152,
    images: img("planter", 3), colors: ["#A8813F", "#3E4136"], sizes: ["Small", "Medium", "Large"],
    outOfStockSizes: [], isNew: true, stock: 33,
    description: "Hand-woven natural rattan over a weatherproof liner. Brings warmth to a balcony, a porch, or a sunlit corner.",
    specs: { Material: "Rattan, poly liner", Drainage: "Yes, with tray", Weather: "Covered outdoor use", Origin: "Made in Indonesia" },
  },
  {
    id: "p-005", title: "Solstice Stoneware Dinner Set", category: "kitchen",
    price: 96, compareAtPrice: null, rating: 4.9, reviewCount: 271,
    images: img("dinner", 4), colors: ["#E7E2D6", "#A5402A"], sizes: [],
    outOfStockSizes: [], isNew: false, stock: 18,
    description: "A four-piece place setting in reactive glaze — every piece slightly its own, none of them quite the same.",
    specs: { Material: "Stoneware ceramic", Pieces: "4 per set", Care: "Dishwasher & microwave safe", Origin: "Made in Portugal" },
  },
  {
    id: "p-006", title: "Wilder Wool Throw", category: "textiles",
    price: 89, compareAtPrice: 105, rating: 4.5, reviewCount: 63,
    images: img("throw", 3), colors: ["#3E4136", "#726F63", "#EDEBE2"], sizes: [],
    outOfStockSizes: [], isNew: false, stock: 0,
    description: "A heavyweight lambswool throw, woven on century-old looms in the Scottish Borders. Warm without the weight.",
    specs: { Material: "100% lambswool", Size: "130 x 180cm", Care: "Dry clean only", Origin: "Made in Scotland" },
  },
  {
    id: "p-007", title: "Halo Pendant Light", category: "lighting",
    price: 156, compareAtPrice: null, rating: 4.7, reviewCount: 44,
    images: img("pendant", 3), colors: ["#191C15", "#E7E2D6"], sizes: [],
    outOfStockSizes: [], isNew: true, stock: 9,
    description: "A ribbed glass pendant that scatters light in soft, uneven pools — a quiet centerpiece for any table.",
    specs: { Material: "Ribbed glass, steel", Bulb: "E26, not included", Drop: "Adjustable to 150cm", Origin: "Made in Denmark" },
  },
  {
    id: "p-008", title: "Quarry Outdoor Lounge Chair", category: "outdoor",
    price: 340, compareAtPrice: 395, rating: 4.8, reviewCount: 58,
    images: img("chair", 4), colors: ["#726F63", "#191C15"], sizes: [],
    outOfStockSizes: [], isNew: false, stock: 6,
    description: "Powder-coated aluminum frame with quick-dry rope weave. Built for long afternoons that run into evening.",
    specs: { Material: "Aluminum, poly rope", Weight: "38 lbs", Weather: "All-season", Origin: "Made in Italy" },
  },
  {
    id: "p-009", title: "Fen Linen Napkin Set", category: "textiles",
    price: 34, compareAtPrice: null, rating: 4.6, reviewCount: 121,
    images: img("napkin", 2), colors: ["#EDEBE2", "#A8813F", "#3E4136"], sizes: [],
    outOfStockSizes: [], isNew: false, stock: 62,
    description: "Set of six stonewashed linen napkins with a mitred hem, softening beautifully with every wash.",
    specs: { Material: "100% linen", Pieces: "Set of 6", Care: "Machine wash cold", Origin: "Made in Lithuania" },
  },
  {
    id: "p-010", title: "Ember Cast Iron Skillet", category: "kitchen",
    price: 72, compareAtPrice: null, rating: 4.9, reviewCount: 302,
    images: img("skillet", 3), colors: ["#191C15"], sizes: ["10in", "12in"],
    outOfStockSizes: [], isNew: false, stock: 27,
    description: "Pre-seasoned cast iron with a helper handle, cast in a single pour for even heat, edge to edge.",
    specs: { Material: "Cast iron", Seasoning: "Pre-seasoned, food-safe", Care: "Hand wash, oil after use", Origin: "Made in USA" },
  },
  {
    id: "p-011", title: "Marsh Rattan Pendant Shade", category: "lighting",
    price: 84, compareAtPrice: 99, rating: 4.4, reviewCount: 39,
    images: img("shade", 3), colors: ["#A8813F"], sizes: [],
    outOfStockSizes: [], isNew: false, stock: 15,
    description: "Open-weave rattan shade that casts dappled light across the ceiling — a warm-weather staple, year round.",
    specs: { Material: "Natural rattan", Bulb: "E26, not included", Drop: "Fixed 40cm", Origin: "Made in Indonesia" },
  },
  {
    id: "p-012", title: "Grove Teak Side Table", category: "outdoor",
    price: 128, compareAtPrice: null, rating: 4.7, reviewCount: 84,
    images: img("table", 3), colors: ["#A8813F"], sizes: [],
    outOfStockSizes: [], isNew: true, stock: 21,
    description: "Solid teak, finished to weather gracefully outdoors. A steady hand for a drink, a book, a candle.",
    specs: { Material: "Solid teak", Dimensions: "18 x 18 x 20 in", Weather: "All-season, untreated finish", Origin: "Made in Vietnam" },
  },
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function getRelatedProducts(product, count = 4) {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, count);
}

export function getPriceBounds() {
  const prices = PRODUCTS.map((p) => p.price);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}
