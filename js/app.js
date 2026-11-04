import { PRODUCTS, CATEGORIES, filterProducts, getProductById } from "./products.js";
import {
  calculateCartTotals,
  addItemToCart,
  updateCartQuantity,
  removeCartItem
} from "./cartLogic.js";

// Local storage key
const STORAGE_KEY = "aura_studio_cart_v1";

// State
let cart = loadCart();
let activeCategory = "all";
let activeSize = "all";
let searchQuery = "";
let currentSort = "featured";
let activeCoupon = "";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryPills();
  renderSizePills();
  renderProducts();
  updateCartUI();
  setupEventListeners();
});

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn("Could not load cart from localStorage", e);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not save cart to localStorage", e);
  }
}

function renderCategoryPills() {
  const container = document.getElementById("category-filters");
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button
      type="button"
      class="filter-pill ${cat.id === activeCategory ? 'is-active' : ''}"
      data-category="${cat.id}"
      aria-pressed="${cat.id === activeCategory}"
    >
      ${cat.label}
    </button>
  `).join("");
}

function getAvailableSizes() {
  const set = new Set();
  PRODUCTS.forEach(p => {
    if (Array.isArray(p.sizes)) {
      p.sizes.forEach(s => set.add(s));
    }
  });
  const order = ["XS", "S", "M", "L", "XL", "S/M", "L/XL", "One Size"];
  const list = Array.from(set);
  list.sort((a, b) => {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  return ["all", ...list];
}

function renderSizePills() {
  const container = document.getElementById("size-filters");
  if (!container) return;

  const sizes = getAvailableSizes();
  container.innerHTML = sizes.map(size => {
    const label = size === "all" ? "ทุกไซส์" : size;
    const isActive = size === activeSize;
    return `
      <button
        type="button"
        class="size-pill ${isActive ? 'is-active' : ''}"
        data-size="${size}"
        aria-pressed="${isActive}"
      >
        ${label}
      </button>
    `;
  }).join("");
}

function renderProductVisual(svgType, bg) {
  // Bespoke aesthetic minimalist garment vector illustration
  return `
    <div class="product-art-wrapper" style="background-color: ${bg};">
      <svg class="product-art-svg" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="warmShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#4A3F35" stop-opacity="0.12"/>
          </linearGradient>
        </defs>
        ${getGarmentPath(svgType)}
      </svg>
    </div>
  `;
}

function getGarmentPath(type) {
  switch (type) {
    case "shirt":
      return `
        <!-- Minimal Shirt Vector -->
        <path d="M70 42 L100 62 L130 42 L162 70 L146 102 L132 94 L132 198 L68 198 L68 94 L54 102 L38 70 Z" fill="#E8DEC8" stroke="#8D7A65" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M100 62 L100 198" stroke="#8D7A65" stroke-width="1.8" stroke-dasharray="3 3"/>
        <path d="M85 45 C95 56 105 56 115 45" stroke="#685545" stroke-width="2" fill="none"/>
        <circle cx="100" cy="95" r="2.5" fill="#5A4738"/>
        <circle cx="100" cy="125" r="2.5" fill="#5A4738"/>
        <circle cx="100" cy="155" r="2.5" fill="#5A4738"/>
      `;
    case "trousers":
      return `
        <!-- Minimal Trousers Vector -->
        <path d="M60 48 L140 48 L144 198 L112 198 L100 105 L88 198 L56 198 Z" fill="#D6C7B2" stroke="#7A6855" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M60 62 L140 62" stroke="#7A6855" stroke-width="1.8"/>
        <path d="M80 62 L80 102" stroke="#7A6855" stroke-width="1.5" stroke-dasharray="2 2"/>
        <path d="M120 62 L120 102" stroke="#7A6855" stroke-width="1.5" stroke-dasharray="2 2"/>
        <circle cx="100" cy="55" r="2" fill="#4B3B2F"/>
      `;
    case "coat":
      return `
        <!-- Minimal Trench Coat -->
        <path d="M66 38 L100 60 L134 38 L170 82 L150 106 L138 98 L138 206 L62 206 L62 98 L50 106 L30 82 Z" fill="#CBBBA8" stroke="#74624F" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M88 40 L108 108 L100 206" stroke="#74624F" stroke-width="2"/>
        <path d="M54 122 L146 122" stroke="#5A4838" stroke-width="4" stroke-linecap="round"/>
        <rect x="94" y="119" width="12" height="10" rx="1.5" fill="#FAF6EE" stroke="#5A4838" stroke-width="2"/>
      `;
    case "tank":
      return `
        <!-- Minimal Knit Tank -->
        <path d="M72 40 L90 40 L90 74 C96 82 104 82 110 74 L110 40 L128 40 L134 86 L128 192 L72 192 L66 86 Z" fill="#ECE2D3" stroke="#8A7763" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M78 88 L78 184" stroke="#9A8772" stroke-width="1" stroke-dasharray="2 3"/>
        <path d="M100 88 L100 184" stroke="#9A8772" stroke-width="1" stroke-dasharray="2 3"/>
        <path d="M122 88 L122 184" stroke="#9A8772" stroke-width="1" stroke-dasharray="2 3"/>
      `;
    case "dress":
      return `
        <!-- Minimal Midi Dress -->
        <path d="M78 40 L100 60 L122 40 L136 78 L126 88 L120 84 L148 206 L52 206 L80 84 L74 88 L64 78 Z" fill="#E4D7C3" stroke="#87745F" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M82 86 C98 94 116 102 124 114" stroke="#6C5B4A" stroke-width="2"/>
        <path d="M68 116 C88 122 108 124 136 126" stroke="#6C5B4A" stroke-width="1.8" stroke-dasharray="3 3"/>
      `;
    case "bag":
      return `
        <!-- Minimal Canvas Tote -->
        <rect x="52" y="88" width="96" height="104" rx="4" fill="#DECDBB" stroke="#7E6C59" stroke-width="2.5"/>
        <path d="M80 88 L80 50 C80 42 120 42 120 50 L120 88" stroke="#645241" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <line x1="72" y1="112" x2="128" y2="112" stroke="#A89783" stroke-width="1.5" stroke-dasharray="3 2"/>
        <rect x="76" y="130" width="48" height="38" rx="2" fill="#FAF6EE" stroke="#7E6C59" stroke-width="1.5"/>
      `;
    case "cardigan":
      return `
        <!-- Fine Knit Cardigan -->
        <path d="M68 40 L100 58 L132 40 L164 78 L148 106 L134 96 L134 198 L66 198 L66 96 L52 106 L36 78 Z" fill="#D8CEBF" stroke="#776755" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M100 58 L86 106 L86 198" stroke="#776755" stroke-width="2"/>
        <circle cx="86" cy="116" r="2.5" fill="#584838"/>
        <circle cx="86" cy="144" r="2.5" fill="#584838"/>
        <circle cx="86" cy="172" r="2.5" fill="#584838"/>
      `;
    case "shorts":
      return `
        <!-- Bermuda Shorts -->
        <path d="M62 58 L138 58 L142 152 L108 152 L100 102 L92 152 L58 152 Z" fill="#D3C3AF" stroke="#786653" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="62" y1="72" x2="138" y2="72" stroke="#786653" stroke-width="1.5"/>
        <line x1="78" y1="72" x2="78" y2="100" stroke="#786653" stroke-width="1.5" stroke-dasharray="2 2"/>
        <line x1="122" y1="72" x2="122" y2="100" stroke="#786653" stroke-width="1.5" stroke-dasharray="2 2"/>
      `;
    default:
      return `<rect x="60" y="60" width="80" height="120" rx="4" fill="#D8CEBF" stroke="#776755" stroke-width="2"/>`;
  }
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  const countLabel = document.getElementById("product-count-label");
  if (!grid) return;

  let filtered = filterProducts({
    category: activeCategory,
    searchQuery: searchQuery,
    sort: currentSort
  });

  if (activeSize && activeSize !== "all") {
    filtered = filtered.filter(item => Array.isArray(item.sizes) && item.sizes.includes(activeSize));
  }

  if (countLabel) {
    countLabel.textContent = `แสดง ${filtered.length} รายการ`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p class="empty-title">ไม่พบสินค้าที่คุณกำลังค้นหา</p>
        <p class="empty-subtitle">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูนะคะ</p>
        <button type="button" class="btn btn-outline" id="reset-filter-btn">ดูสินค้าทั้งหมด</button>
      </div>
    `;
    const resetBtn = document.getElementById("reset-filter-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        activeCategory = "all";
        activeSize = "all";
        searchQuery = "";
        const searchInput = document.getElementById("catalog-search");
        if (searchInput) searchInput.value = "";
        renderCategoryPills();
        renderSizePills();
        renderProducts();
      });
    }
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <article class="product-card" data-id="${item.id}">
      <div class="product-media">
        <span class="product-tag">${item.tag}</span>
        ${renderProductVisual(item.svgType, item.imageBg)}
        <button
          type="button"
          class="btn-quick-view"
          data-action="quick-view"
          data-id="${item.id}"
          aria-label="ดูรายละเอียด ${item.name}"
        >
          ดูรายละเอียด
        </button>
      </div>
      <div class="product-info">
        <div class="product-swatches">
          ${item.colors.map((c, i) => `
            <span
              class="swatch-dot ${i === 0 ? 'is-selected' : ''}"
              style="background-color: ${c.hex};"
              title="${c.name}"
              aria-label="${c.name}"
            ></span>
          `).join("")}
        </div>
        <h3 class="product-title" data-action="quick-view" data-id="${item.id}">${item.name}</h3>
        <p class="product-thai-name">${item.thaiName}</p>
        <div class="product-meta-row">
          <span class="product-price">฿${item.price.toLocaleString("th-TH")}</span>
          <button
            type="button"
            class="btn-add-quick"
            data-action="add-to-cart"
            data-id="${item.id}"
            title="หยิบใส่ตะกร้าทันที"
          >
            + ใส่ตะกร้า
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function updateCartUI() {
  const totals = calculateCartTotals(cart, activeCoupon);
  const badge = document.getElementById("cart-badge-count");
  const countHeading = document.getElementById("cart-drawer-count");
  const itemsContainer = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping");
  const discountRow = document.getElementById("cart-discount-row");
  const discountEl = document.getElementById("cart-discount");
  const totalEl = document.getElementById("cart-total");
  const freeShipBar = document.getElementById("free-shipping-progress");
  const freeShipText = document.getElementById("free-shipping-text");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (badge) {
    badge.textContent = totals.totalCount;
    badge.classList.toggle("is-hidden", totals.totalCount === 0);
  }

  if (countHeading) {
    countHeading.textContent = `(${totals.totalCount})`;
  }

  if (subtotalEl) {
    subtotalEl.textContent = `฿${totals.subtotal.toLocaleString("th-TH")}`;
  }

  if (shippingEl) {
    if (cart.length === 0) {
      shippingEl.textContent = "฿0";
    } else if (totals.shipping === 0) {
      shippingEl.innerHTML = `<span class="tag-free">ส่งฟรี</span>`;
    } else {
      shippingEl.textContent = `฿${totals.shipping.toLocaleString("th-TH")}`;
    }
  }

  if (discountRow && discountEl) {
    if (totals.discount > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-฿${totals.discount.toLocaleString("th-TH")}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  if (totalEl) {
    totalEl.textContent = `฿${totals.total.toLocaleString("th-TH")}`;
  }

  if (freeShipBar && freeShipText) {
    if (totals.subtotal >= 1500) {
      freeShipBar.style.width = "100%";
      freeShipText.innerHTML = `<strong>ยอดเยี่ยม!</strong> คุณได้รับสิทธิ์จัดส่งฟรีแล้วค่ะ ✨`;
    } else {
      const percent = Math.min(100, Math.round((totals.subtotal / 1500) * 100));
      freeShipBar.style.width = `${percent}%`;
      freeShipText.innerHTML = `ช้อปอีกเพียง <strong>฿${totals.freeShippingRemaining.toLocaleString("th-TH")}</strong> เพื่อรับสิทธิ์ส่งฟรี`;
    }
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        <p class="empty-title">ตะกร้าของคุณยังว่างอยู่</p>
        <p class="empty-subtitle">เลือกชมสินค้าที่เข้ากับไลฟ์สไตล์ของคุณได้เลยค่ะ</p>
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item-visual" style="background-color: ${item.imageBg};">
        <svg viewBox="0 0 200 240" fill="none" class="cart-mini-svg">
          ${getGarmentPath(item.svgType)}
        </svg>
      </div>
      <div class="cart-item-details">
        <div class="cart-item-top">
          <h4 class="cart-item-title">${item.name}</h4>
          <button
            type="button"
            class="btn-remove-item"
            data-action="remove-item"
            data-key="${item.key}"
            aria-label="ลบสินค้านี้"
            title="ลบ"
          >
            ×
          </button>
        </div>
        <p class="cart-item-variant">
          <span class="cart-item-color-indicator" style="background-color: ${item.colorHex};"></span>
          ${item.color} / ไซส์ ${item.size}
        </p>
        <div class="cart-item-bottom">
          <span class="cart-item-price">฿${(item.price * item.quantity).toLocaleString("th-TH")}</span>
          <div class="quantity-controller">
            <button
              type="button"
              class="qty-btn"
              data-action="decrease-qty"
              data-key="${item.key}"
              aria-label="ลดจำนวน"
            >−</button>
            <span class="qty-display">${item.quantity}</span>
            <button
              type="button"
              class="qty-btn"
              data-action="increase-qty"
              data-key="${item.key}"
              aria-label="เพิ่มจำนวน"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  if (drawer && backdrop) {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    document.body.classList.add("modal-open");
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  if (drawer && backdrop) {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  }
}

function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const modal = document.getElementById("quick-view-modal");
  const modalBody = document.getElementById("quick-view-content");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-product-layout">
      <div class="modal-product-visual" style="background-color: ${product.imageBg};">
        <span class="product-badge">${product.badge}</span>
        <svg viewBox="0 0 200 240" fill="none" class="modal-large-svg">
          ${getGarmentPath(product.svgType)}
        </svg>
      </div>
      <div class="modal-product-details">
        <span class="modal-category">${product.category.toUpperCase()}</span>
        <h2 class="modal-title">${product.name}</h2>
        <p class="modal-thai-title">${product.thaiName}</p>
        <p class="modal-price">฿${product.price.toLocaleString("th-TH")}</p>

        <p class="modal-description">${product.description}</p>

        <div class="modal-selection-group">
          <label class="selection-label">สี: <span id="selected-color-label">${product.colors[0].name}</span></label>
          <div class="color-options-row">
            ${product.colors.map((c, i) => `
              <label class="color-option-item">
                <input
                  type="radio"
                  name="modal-color"
                  value="${c.name}"
                  data-hex="${c.hex}"
                  ${i === 0 ? "checked" : ""}
                />
                <span class="color-option-swatch" style="background-color: ${c.hex};" title="${c.name}"></span>
              </label>
            `).join("")}
          </div>
        </div>

        <div class="modal-selection-group">
          <div class="selection-label-row">
            <label class="selection-label">ไซส์</label>
            <span class="size-guide-hint">ขนาดมาตรฐาน Unisex/Regular</span>
          </div>
          <div class="size-options-row">
            ${product.sizes.map((s, i) => `
              <label class="size-option-item">
                <input
                  type="radio"
                  name="modal-size"
                  value="${s}"
                  ${i === 0 ? "checked" : ""}
                />
                <span class="size-option-box">${s}</span>
              </label>
            `).join("")}
          </div>
        </div>

        <div class="modal-action-row">
          <div class="modal-qty-picker">
            <button type="button" class="btn-picker-qty" id="modal-qty-minus">−</button>
            <span id="modal-qty-val">1</span>
            <button type="button" class="btn-picker-qty" id="modal-qty-plus">+</button>
          </div>
          <button type="button" class="btn btn-primary btn-add-modal" id="modal-submit-add" data-id="${product.id}">
            เพิ่มลงในตะกร้า
          </button>
        </div>

        <div class="modal-extra-info">
          <div class="info-item">
            <strong>วัสดุและเส้นใย:</strong> ${product.fabric}
          </div>
          <div class="info-item">
            <strong>การดูแลรักษา:</strong> ${product.care}
          </div>
          <div class="info-item">
            <strong>นโยบายจัดส่ง:</strong> จัดส่งฟรีเมื่อยอดช้อปครบ ฿1,500 สามารถเปลี่ยนไซส์ได้ภายใน 14 วัน
          </div>
        </div>
      </div>
    </div>
  `;

  // Qty picker logic in modal
  let modalQty = 1;
  const minusBtn = document.getElementById("modal-qty-minus");
  const plusBtn = document.getElementById("modal-qty-plus");
  const qtyVal = document.getElementById("modal-qty-val");
  const colorLabel = document.getElementById("selected-color-label");

  if (minusBtn && plusBtn && qtyVal) {
    minusBtn.addEventListener("click", () => {
      if (modalQty > 1) {
        modalQty--;
        qtyVal.textContent = modalQty;
      }
    });
    plusBtn.addEventListener("click", () => {
      modalQty++;
      qtyVal.textContent = modalQty;
    });
  }

  const colorRadios = modalBody.querySelectorAll('input[name="modal-color"]');
  colorRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (colorLabel) colorLabel.textContent = e.target.value;
    });
  });

  const submitBtn = document.getElementById("modal-submit-add");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const selectedColor = modalBody.querySelector('input[name="modal-color"]:checked')?.value;
      const selectedSize = modalBody.querySelector('input[name="modal-size"]:checked')?.value;
      cart = addItemToCart(cart, product, selectedSize, selectedColor, modalQty);
      saveCart();
      updateCartUI();
      closeQuickView();
      openCartDrawer();
      showToast(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
    });
  }

  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
}

function closeQuickView() {
  const modal = document.getElementById("quick-view-modal");
  if (modal) {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  }
}

function openCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  const checkoutItemsContainer = document.getElementById("checkout-order-summary");
  const totals = calculateCartTotals(cart, activeCoupon);

  if (!modal || !checkoutItemsContainer) return;

  checkoutItemsContainer.innerHTML = `
    <div class="checkout-summary-box">
      <h3 class="summary-box-title">สรุปรายการสั่งซื้อ (${totals.totalCount} ชิ้น)</h3>
      <div class="checkout-items-list">
        ${cart.map(item => `
          <div class="checkout-row-item">
            <span>${item.name} (${item.color}, ${item.size}) × ${item.quantity}</span>
            <span>฿${(item.price * item.quantity).toLocaleString("th-TH")}</span>
          </div>
        `).join("")}
      </div>
      <div class="checkout-calc-list">
        <div class="checkout-calc-row">
          <span>ยอดรวมสินค้า</span>
          <span>฿${totals.subtotal.toLocaleString("th-TH")}</span>
        </div>
        ${totals.discount > 0 ? `
          <div class="checkout-calc-row text-discount">
            <span>ส่วนลด (${totals.appliedCoupon?.code})</span>
            <span>-฿${totals.discount.toLocaleString("th-TH")}</span>
          </div>
        ` : ""}
        <div class="checkout-calc-row">
          <span>ค่าจัดส่ง</span>
          <span>${totals.shipping === 0 ? "ฟรี" : `฿${totals.shipping}`}</span>
        </div>
        <div class="checkout-calc-total">
          <strong>ยอดชำระสุทธิ</strong>
          <strong class="total-highlight">฿${totals.total.toLocaleString("th-TH")}</strong>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  if (modal) {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  }
}

function showToast(message) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function setupEventListeners() {
  // Category filter clicks
  const categoryFilters = document.getElementById("category-filters");
  if (categoryFilters) {
    categoryFilters.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      activeCategory = btn.dataset.category;
      renderCategoryPills();
      renderProducts();
    });
  }

  // Size pill filter clicks
  const sizeFilters = document.getElementById("size-filters");
  if (sizeFilters) {
    sizeFilters.addEventListener("click", (e) => {
      const btn = e.target.closest(".size-pill");
      if (!btn) return;
      activeSize = btn.dataset.size;
      renderSizePills();
      renderProducts();
    });
  }

  // Search input
  const searchInput = document.getElementById("catalog-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById("catalog-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Product Grid clicks (Delegation)
  const productGrid = document.getElementById("product-grid");
  if (productGrid) {
    productGrid.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("[data-action]");
      if (!actionBtn) return;

      const action = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;
      const product = getProductById(id);

      if (action === "quick-view") {
        openQuickView(id);
      } else if (action === "add-to-cart") {
        if (product) {
          cart = addItemToCart(cart, product, product.sizes[0], product.colors[0].name, 1);
          saveCart();
          updateCartUI();
          showToast(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว`);
        }
      }
    });
  }

  // Cart Drawer open/close triggers
  const openCartBtn = document.getElementById("btn-open-cart");
  if (openCartBtn) {
    openCartBtn.addEventListener("click", openCartDrawer);
  }

  const closeCartBtn = document.getElementById("btn-close-cart");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCartDrawer);
  }

  const backdrop = document.getElementById("drawer-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closeCartDrawer();
      closeQuickView();
      closeCheckoutModal();
    });
  }

  // Cart Item Actions (increase, decrease, remove)
  const cartContainer = document.getElementById("cart-items-container");
  if (cartContainer) {
    cartContainer.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;

      const action = target.dataset.action;
      const key = target.dataset.key;
      const existing = cart.find(i => i.key === key);

      if (action === "increase-qty" && existing) {
        cart = updateCartQuantity(cart, key, existing.quantity + 1);
        saveCart();
        updateCartUI();
      } else if (action === "decrease-qty" && existing) {
        cart = updateCartQuantity(cart, key, existing.quantity - 1);
        saveCart();
        updateCartUI();
      } else if (action === "remove-item") {
        cart = removeCartItem(cart, key);
        saveCart();
        updateCartUI();
        showToast("นำสินค้าออกจากตะกร้าแล้ว");
      }
    });
  }

  // Promo Code Form
  const promoForm = document.getElementById("promo-form");
  const promoInput = document.getElementById("promo-input");
  const promoFeedback = document.getElementById("promo-feedback");

  if (promoForm && promoInput) {
    promoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      activeCoupon = code;
      const totals = calculateCartTotals(cart, activeCoupon);

      if (totals.appliedCoupon) {
        promoFeedback.className = "promo-feedback is-success";
        promoFeedback.textContent = `ใช้โค้ด ${code} สำเร็จ: ${totals.appliedCoupon.description}`;
        updateCartUI();
      } else {
        activeCoupon = "";
        promoFeedback.className = "promo-feedback is-error";
        promoFeedback.textContent = "โค้ดส่วนลดนี้ไม่ถูกต้องหรือหมดอายุ (ลองใช้ AURA10 หรือ FREESHIP)";
        updateCartUI();
      }
    });
  }

  // Checkout button inside Cart Drawer
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  // Quick View Close
  const closeQuickBtn = document.getElementById("btn-close-quick-view");
  if (closeQuickBtn) {
    closeQuickBtn.addEventListener("click", closeQuickView);
  }

  // Checkout Modal Close
  const closeCheckoutBtn = document.getElementById("btn-close-checkout");
  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
  }

  // Checkout Form Submission Simulation
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "กำลังดำเนินการสั่งซื้อ...";
      }

      setTimeout(() => {
        const orderId = "AURA-" + Math.floor(100000 + Math.random() * 900000);
        const buyerName = document.getElementById("cust-name")?.value || "คุณลูกค้า";

        const checkoutContent = document.getElementById("checkout-modal-content");
        if (checkoutContent) {
          checkoutContent.innerHTML = `
            <div class="order-success-card">
              <div class="success-icon-badge">✓</div>
              <h2 class="order-success-title">ขอบพระคุณสำหรับการสั่งซื้อค่ะ</h2>
              <p class="order-success-msg">ทางแบรนด์ AURA STUDIO ได้รับคำสั่งซื้อของคุณ <strong>${buyerName}</strong> เรียบร้อยแล้ว</p>
              <div class="order-id-box">
                <span>หมายเลขคำสั่งซื้อของคุณ:</span>
                <strong>${orderId}</strong>
              </div>
              <p class="order-delivery-note">เจ้าหน้าที่จะจัดเตรียมสินค้าและแจ้งเลขพัสดุให้คุณทราบผ่านอีเมล/SMS ภายใน 24 ชม. นะคะ</p>
              <button type="button" class="btn btn-primary" id="btn-back-to-shop">เลือกซื้อสินค้าต่อ</button>
            </div>
          `;

          const backBtn = document.getElementById("btn-back-to-shop");
          if (backBtn) {
            backBtn.addEventListener("click", () => {
              cart = [];
              activeCoupon = "";
              saveCart();
              updateCartUI();
              closeCheckoutModal();
              // reload page or clean state
              window.location.reload();
            });
          }
        }
      }, 900);
    });
  }

  // Smooth scroll for nav anchor
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}
