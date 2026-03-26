/**
 * TCDA — Cart · 多言語 · 多通貨 対応
 *
 * - 5言語 (en/zh/es/ar/ja) の翻訳を内蔵
 * - TCDACurrency があれば選択通貨で価格表示
 * - TCDAi18n があれば data-i18n 属性を自動翻訳
 * - イベント委譲で動的カードにも対応
 */

// ── 多言語定義 ─────────────────────────────────────────────────────────────

const CART_STRINGS = {
  en: {
    title:      "Cart",
    empty:      "Your cart is empty.",
    total:      "Total",
    remove:     "Remove",
    checkout:   "Checkout with Stripe",
    processing: "Processing…",
    secure:     "Secure payment by Stripe",
    added:      "Added ✓",
  },
  zh: {
    title:      "购物车",
    empty:      "您的购物车是空的。",
    total:      "合计",
    remove:     "移除",
    checkout:   "通过 Stripe 结账",
    processing: "处理中…",
    secure:     "由 Stripe 提供安全支付",
    added:      "已添加 ✓",
  },
  es: {
    title:      "Carrito",
    empty:      "Tu carrito está vacío.",
    total:      "Total",
    remove:     "Eliminar",
    checkout:   "Pagar con Stripe",
    processing: "Procesando…",
    secure:     "Pago seguro por Stripe",
    added:      "Añadido ✓",
  },
  ar: {
    title:      "عربة التسوق",
    empty:      "سلة التسوق فارغة.",
    total:      "الإجمالي",
    remove:     "إزالة",
    checkout:   "الدفع عبر Stripe",
    processing: "جاري المعالجة…",
    secure:     "دفع آمن بواسطة Stripe",
    added:      "تمت الإضافة ✓",
  },
  ja: {
    title:      "カート",
    empty:      "カートは空です。",
    total:      "合計",
    remove:     "削除",
    checkout:   "Stripeで決済する",
    processing: "処理中…",
    secure:     "Stripeによるセキュア決済",
    added:      "追加済み ✓",
  },
};

function cartT(key) {
  const lang = window.TCDAi18n?.getCurrentLang?.() || "en";
  return (CART_STRINGS[lang] || CART_STRINGS.en)[key] || CART_STRINGS.en[key] || key;
}

// ── API ベース URL ─────────────────────────────────────────────────────────
// Live Server（5500/5501）から使う場合は Express サーバー（3000）を絶対 URL で指定。
// 本番環境（同一オリジン）では相対パスを使う。
const LIVE_SERVER_PORTS = ["5500", "5501"];
const API_BASE = LIVE_SERVER_PORTS.includes(window.location.port)
  ? "http://localhost:3000"
  : "";

// ── Storage ────────────────────────────────────────────────────────────────

const CART_KEY = "tcda_cart";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(item) {
  const cart     = getCart();
  const existing = cart.find((c) => c.id === item.id && c.size === item.size);
  if (existing) { existing.quantity += 1; }
  else          { cart.push({ ...item, quantity: 1 }); }
  saveCart(cart);
}

function removeFromCart(id, size) {
  saveCart(getCart().filter((c) => !(c.id === id && c.size === size)));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
}

// ── UI ─────────────────────────────────────────────────────────────────────

function updateCartUI() {
  const total = getCart().reduce((s, c) => s + c.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = total;
  });
}

/** カードコンテナ内で選択中のサイズを返す */
function getSelectedSize(container) {
  const scope = container || document;
  return scope.querySelector?.(".size-btn[aria-pressed='true']")?.textContent?.trim() || null;
}

/** 価格を現在の通貨でフォーマット */
function fmtPrice(jpy) {
  const currency = window.TCDACurrency?.getCurrentCurrency?.() || "JPY";
  return window.TCDACurrency?.formatPrice?.(jpy, currency) || `JPY ${jpy.toLocaleString()}`;
}

// ── Cart Modal ─────────────────────────────────────────────────────────────

function buildCartModal() {
  if (document.getElementById("cart-modal")) return;

  const modal = document.createElement("div");
  modal.id = "cart-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", cartT("title"));
  modal.hidden = true;

  // data-i18n-cart-* 属性を使って TCDAi18n.apply() でも更新可能にする
  modal.innerHTML = `
    <div class="cart-backdrop" data-cart-close></div>
    <div class="cart-drawer">
      <div class="cart-drawer-head">
        <p class="eyebrow" data-i18n="cart_label">${cartT("title")}</p>
        <button class="cart-close-btn" type="button" data-cart-close
                aria-label="Close cart">✕</button>
      </div>
      <div class="cart-drawer-body" id="cart-items-list"></div>
      <div class="cart-drawer-foot">
        <div class="cart-total-row">
          <span class="cart-total-label">${cartT("total")}</span>
          <span id="cart-total-price">—</span>
        </div>
        <button class="btn" type="button" id="checkout-btn">${cartT("checkout")}</button>
        <p class="cart-secure-note">${cartT("secure")}</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById("checkout-btn").addEventListener("click", startCheckout);

  // 現在の言語を即座に適用
  if (window.TCDAi18n) {
    TCDAi18n.apply(TCDAi18n.getCurrentLang());
  }
}

function refreshModalLabels() {
  const modal = document.getElementById("cart-modal");
  if (!modal) return;
  const label = modal.querySelector(".cart-total-label");
  const checkoutBtn = document.getElementById("checkout-btn");
  const secure = modal.querySelector(".cart-secure-note");
  if (label)       label.textContent       = cartT("total");
  if (checkoutBtn) checkoutBtn.textContent = cartT("checkout");
  if (secure)      secure.textContent      = cartT("secure");
}

function openCart() {
  buildCartModal();
  renderCartItems();
  const modal = document.getElementById("cart-modal");
  if (modal) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // 言語・通貨が変わっている可能性があるのでラベルを更新
    refreshModalLabels();
  }
}

function closeCart() {
  const modal = document.getElementById("cart-modal");
  if (modal) {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
}

function renderCartItems() {
  const cart    = getCart();
  const list    = document.getElementById("cart-items-list");
  const totalEl = document.getElementById("cart-total-price");
  if (!list) return;

  if (!cart.length) {
    list.innerHTML = `<p class="cart-empty">${cartT("empty")}</p>`;
    if (totalEl) totalEl.textContent = "—";
    return;
  }

  const totalJpy = cart.reduce((s, c) => s + c.priceJpy * c.quantity, 0);
  if (totalEl) totalEl.textContent = fmtPrice(totalJpy);

  list.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        ${item.size ? `<p class="cart-item-meta">Size: ${item.size}</p>` : ""}
        <p class="cart-item-meta">× ${item.quantity}</p>
      </div>
      <div class="cart-item-right">
        <p class="cart-item-price">${fmtPrice(item.priceJpy * item.quantity)}</p>
        <button class="cart-remove-btn" type="button"
                data-remove-id="${item.id}"
                data-remove-size="${item.size || ""}">${cartT("remove")}</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-remove-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.removeId, btn.dataset.removeSize);
      renderCartItems();
    });
  });
}

// ── Stripe Checkout ────────────────────────────────────────────────────────

async function startCheckout() {
  const cart = getCart();
  if (!cart.length) return;

  const btn = document.getElementById("checkout-btn");
  if (btn) { btn.textContent = cartT("processing"); btn.disabled = true; }

  try {
    const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.id,
          name:      item.name,
          priceJpy:  item.priceJpy,
          quantity:  item.quantity,
          size:      item.size || "",
        })),
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // Stripe Checkout へリダイレクト
    } else {
      alert(data.error || "Checkout failed. Please try again.");
      if (btn) { btn.textContent = cartT("checkout"); btn.disabled = false; }
    }
  } catch (err) {
    console.error("[Cart] Checkout エラー:", err);
    alert("Network error. Please try again.");
    if (btn) { btn.textContent = cartT("checkout"); btn.disabled = false; }
  }
}

// ── Event Delegation（動的カードにも対応）────────────────────────────────

document.addEventListener("click", (e) => {

  // ① サイズボタン — 同一 .size-row 内で選択を切り替え
  const sizeBtn = e.target.closest(".size-btn");
  if (sizeBtn) {
    const row = sizeBtn.closest(".size-row");
    if (row) {
      row.querySelectorAll(".size-btn").forEach((b) => b.setAttribute("aria-pressed", "false"));
      sizeBtn.setAttribute("aria-pressed", "true");
    }
    return;
  }

  // ② カートを閉じる
  if (e.target.closest("[data-cart-close]")) { closeCart(); return; }

  // ③ カートピル → 開く
  if (e.target.closest(".cart-pill")) { openCart(); return; }

  // ④ Add to Cart ボタン
  const addBtn = e.target.closest("[data-add-to-cart]");
  if (addBtn) {
    const id       = addBtn.dataset.productId;
    const name     = addBtn.dataset.productName;
    const priceJpy = parseInt(addBtn.dataset.productPrice || "0", 10);

    if (!id || !priceJpy) {
      console.warn("[Cart] data-product-id または data-product-price が未設定");
      return;
    }

    // カード単位でサイズを取得
    const card = addBtn.closest("[data-product-id]") || addBtn.closest(".card") || addBtn.closest("article");
    const size = getSelectedSize(card);

    addToCart({ id, name, priceJpy, size });

    const original = addBtn.dataset.i18n
      ? (window.TCDAi18n?.t("cart_add", window.TCDAi18n.getCurrentLang?.()) || "Add to Cart")
      : addBtn.textContent;

    addBtn.textContent = cartT("added");
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.textContent = original;
      addBtn.disabled = false;
    }, 1200);

    openCart();
    return;
  }
});

// ── 通貨変更時: カート合計を再描画 ────────────────────────────────────────
// script.js が TCDACurrency.applyPrices() を呼ぶ際にカートも更新
document.addEventListener("tcda:currency:changed", () => {
  if (!document.getElementById("cart-modal")?.hidden) {
    renderCartItems();
  }
});

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  buildCartModal();

  if (window.location.pathname.includes("success")) {
    clearCart();
  }
});

window.openCart  = openCart;
window.closeCart = closeCart;
