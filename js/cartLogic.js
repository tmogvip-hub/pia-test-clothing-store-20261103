import { PROMO_CODES, SHIPPING_RATES } from "./products.js";

/**
 * สร้าง Key ประจำตัวสินค้าในตะกร้าจาก ID + Size + Color
 */
export function createCartItemKey(id, size, color) {
  return `${id}__${size}__${color}`;
}

/**
 * คำนวณสรุปยอดตะกร้าสินค้า (Subtotal, Shipping, Discount, Total)
 */
export function calculateCartTotals(items = [], couponCode = "") {
  const subtotal = items.reduce((acc, item) => {
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const price = Math.max(0, parseFloat(item.price) || 0);
    return acc + price * qty;
  }, 0);

  const totalCount = items.reduce((acc, item) => {
    return acc + (Math.max(1, parseInt(item.quantity, 10) || 1));
  }, 0);

  let shipping = 0;
  if (items.length > 0) {
    shipping = subtotal >= SHIPPING_RATES.freeThreshold ? 0 : SHIPPING_RATES.standard;
  }

  let discount = 0;
  let appliedCoupon = null;
  const cleanCode = (couponCode || "").trim().toUpperCase();

  if (cleanCode && PROMO_CODES[cleanCode]) {
    const promo = PROMO_CODES[cleanCode];

    if (promo.freeShipping) {
      if (items.length > 0) {
        shipping = 0;
        appliedCoupon = { code: cleanCode, ...promo };
      }
    } else if (promo.discountPercent) {
      discount = Math.round((subtotal * promo.discountPercent) / 100);
      appliedCoupon = { code: cleanCode, ...promo };
    } else if (promo.discountFixed) {
      if (!promo.minSpend || subtotal >= promo.minSpend) {
        discount = Math.min(subtotal, promo.discountFixed);
        appliedCoupon = { code: cleanCode, ...promo };
      }
    }
  }

  const freeShippingRemaining = Math.max(0, SHIPPING_RATES.freeThreshold - subtotal);
  const total = Math.max(0, subtotal - discount + shipping);

  return {
    subtotal,
    shipping,
    discount,
    total,
    totalCount,
    freeShippingRemaining,
    isFreeShipping: shipping === 0 && items.length > 0,
    appliedCoupon
  };
}

/**
 * เพิ่มสินค้าลงในตะกร้า
 */
export function addItemToCart(cart = [], product, size, color, quantity = 1) {
  if (!product || !product.id) return cart;
  const chosenSize = size || (product.sizes && product.sizes[0]) || "Default";
  const chosenColor = color || (product.colors && product.colors[0]?.name) || "Default";
  const key = createCartItemKey(product.id, chosenSize, chosenColor);
  const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

  const existingIndex = cart.findIndex(i => i.key === key);

  if (existingIndex >= 0) {
    const copy = [...cart];
    copy[existingIndex] = {
      ...copy[existingIndex],
      quantity: copy[existingIndex].quantity + qtyToAdd
    };
    return copy;
  }

  const newItem = {
    key,
    id: product.id,
    name: product.name,
    thaiName: product.thaiName || product.name,
    price: product.price,
    size: chosenSize,
    color: chosenColor,
    colorHex: product.colors?.find(c => c.name === chosenColor)?.hex || "#D6C7B2",
    svgType: product.svgType || "shirt",
    imageBg: product.imageBg || "#F4EFEA",
    quantity: qtyToAdd
  };

  return [...cart, newItem];
}

/**
 * แก้ไขจำนวนสินค้าในตะกร้า
 */
export function updateCartQuantity(cart = [], key, newQuantity) {
  const qty = parseInt(newQuantity, 10);
  if (qty <= 0) {
    return cart.filter(item => item.key !== key);
  }
  return cart.map(item => {
    if (item.key === key) {
      return { ...item, quantity: qty };
    }
    return item;
  });
}

/**
 * ลบสินค้าออกจากตะกร้า
 */
export function removeCartItem(cart = [], key) {
  return cart.filter(item => item.key !== key);
}
