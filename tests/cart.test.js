import { describe, it } from "node:test";
import assert from "node:assert";

import { PRODUCTS, getProductById, filterProducts, PROMO_CODES } from "../js/products.js";
import {
  calculateCartTotals,
  addItemToCart,
  updateCartQuantity,
  removeCartItem,
  createCartItemKey
} from "../js/cartLogic.js";

describe("AURA STUDIO — Catalog Data Integrity", () => {
  it("should have at least 8 minimal clothing items in catalog", () => {
    assert.ok(Array.isArray(PRODUCTS));
    assert.ok(PRODUCTS.length >= 8, "Expected at least 8 products in the store");
  });

  it("should ensure every product has valid properties, positive price, and sizes", () => {
    for (const item of PRODUCTS) {
      assert.ok(item.id, "Product must have an id");
      assert.ok(item.name, "Product must have an English name");
      assert.ok(item.thaiName, "Product must have a Thai name");
      assert.ok(typeof item.price === "number" && item.price > 0, `Product ${item.id} must have price > 0`);
      assert.ok(Array.isArray(item.sizes) && item.sizes.length > 0, `Product ${item.id} must have sizes`);
      assert.ok(Array.isArray(item.colors) && item.colors.length > 0, `Product ${item.id} must have colors`);
      assert.ok(item.description, `Product ${item.id} must have a description`);
    }
  });

  it("should filter products by category accurately", () => {
    const tops = filterProducts({ category: "tops" });
    assert.ok(tops.length > 0);
    assert.ok(tops.every(item => item.category === "tops"));
  });

  it("should search products by keyword in English and Thai", () => {
    const searchEng = filterProducts({ searchQuery: "linen" });
    assert.ok(searchEng.length > 0);

    const searchThai = filterProducts({ searchQuery: "กางเกง" });
    assert.ok(searchThai.length > 0);
  });

  it("should sort products by price ascending and descending", () => {
    const asc = filterProducts({ sort: "price-low" });
    for (let i = 0; i < asc.length - 1; i++) {
      assert.ok(asc[i].price <= asc[i + 1].price);
    }

    const desc = filterProducts({ sort: "price-high" });
    for (let i = 0; i < desc.length - 1; i++) {
      assert.ok(desc[i].price >= desc[i + 1].price);
    }
  });

  it("should retrieve a product by ID", () => {
    const p = getProductById("aura-001");
    assert.ok(p !== null);
    assert.strictEqual(p.id, "aura-001");
    assert.strictEqual(p.name, "Relaxed Linen Blend Shirt");
  });
});

describe("AURA STUDIO — Cart Logic & Price Calculations", () => {
  it("should create unique item key based on id, size, and color", () => {
    const key1 = createCartItemKey("aura-001", "M", "Warm Sand");
    const key2 = createCartItemKey("aura-001", "L", "Warm Sand");
    const key3 = createCartItemKey("aura-001", "M", "Oatmeal");

    assert.notStrictEqual(key1, key2);
    assert.notStrictEqual(key1, key3);
  });

  it("should add a new product to the cart", () => {
    const product = PRODUCTS[0]; // ฿1290
    const cart = addItemToCart([], product, "M", "Warm Sand", 1);

    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].id, product.id);
    assert.strictEqual(cart[0].size, "M");
    assert.strictEqual(cart[0].quantity, 1);
  });

  it("should increment quantity if the exact same product, size, and color is added", () => {
    const product = PRODUCTS[0];
    let cart = addItemToCart([], product, "M", "Warm Sand", 1);
    cart = addItemToCart(cart, product, "M", "Warm Sand", 2);

    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].quantity, 3);
  });

  it("should calculate correct subtotal and apply standard shipping below ฿1,500 threshold", () => {
    const items = [
      { key: "item-1", price: 690, quantity: 1 }
    ];
    const totals = calculateCartTotals(items);

    assert.strictEqual(totals.subtotal, 690);
    assert.strictEqual(totals.shipping, 60);
    assert.strictEqual(totals.discount, 0);
    assert.strictEqual(totals.total, 750);
    assert.strictEqual(totals.isFreeShipping, false);
    assert.strictEqual(totals.freeShippingRemaining, 810);
  });

  it("should apply FREE shipping when subtotal reaches ฿1,500 threshold", () => {
    const items = [
      { key: "item-1", price: 1590, quantity: 1 }
    ];
    const totals = calculateCartTotals(items);

    assert.strictEqual(totals.subtotal, 1590);
    assert.strictEqual(totals.shipping, 0);
    assert.strictEqual(totals.total, 1590);
    assert.strictEqual(totals.isFreeShipping, true);
    assert.strictEqual(totals.freeShippingRemaining, 0);
  });

  it("should apply AURA10 promo code (10% discount)", () => {
    const items = [
      { key: "item-1", price: 2000, quantity: 1 }
    ];
    const totals = calculateCartTotals(items, "AURA10");

    assert.strictEqual(totals.subtotal, 2000);
    assert.strictEqual(totals.discount, 200); // 10% of 2000
    assert.strictEqual(totals.shipping, 0); // >= 1500
    assert.strictEqual(totals.total, 1800);
    assert.ok(totals.appliedCoupon !== null);
  });

  it("should apply FREESHIP promo code even when subtotal is below threshold", () => {
    const items = [
      { key: "item-1", price: 690, quantity: 1 }
    ];
    const totals = calculateCartTotals(items, "FREESHIP");

    assert.strictEqual(totals.subtotal, 690);
    assert.strictEqual(totals.shipping, 0);
    assert.strictEqual(totals.total, 690);
    assert.ok(totals.appliedCoupon !== null);
  });

  it("should update item quantity correctly", () => {
    const items = [{ key: "k1", price: 500, quantity: 2 }];
    const updated = updateCartQuantity(items, "k1", 5);
    assert.strictEqual(updated[0].quantity, 5);

    // Quantity <= 0 should remove the item
    const removed = updateCartQuantity(items, "k1", 0);
    assert.strictEqual(removed.length, 0);
  });

  it("should remove item from cart by key", () => {
    const items = [
      { key: "k1", price: 500, quantity: 1 },
      { key: "k2", price: 800, quantity: 1 }
    ];
    const result = removeCartItem(items, "k1");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].key, "k2");
  });
});
