/**
 * images.js — 画像自動読み込み・描画ユーティリティ
 *
 * 使い方:
 *   各ページで window.PRODUCTS_BASE を先に宣言してから読み込む。
 *
 *   collection.html (ルート):     window.PRODUCTS_BASE = 'products/';
 *   products/product.html:        window.PRODUCTS_BASE = '';
 *
 * getImages(id)
 *   → main.jpg + sub1〜sub10 のパス配列を返す（存在確認なし）
 *
 * renderImages(id, container)
 *   → img タグを生成して container に追加
 *   → 存在しない画像は onerror で自動削除
 */

/**
 * 商品画像のパス配列を生成
 * @param {string} productId
 * @returns {string[]}
 */
function getImages(productId) {
  var base = (typeof window !== 'undefined' && window.PRODUCTS_BASE !== undefined)
    ? window.PRODUCTS_BASE
    : 'products/';
  var dir = base + productId + '/';
  var list = [dir + 'main.jpg'];
  for (var i = 1; i <= 10; i++) {
    list.push(dir + 'sub' + i + '.jpg');
  }
  return list;
}

/**
 * 画像を DOM に描画
 * @param {string}          productId
 * @param {string|Element}  container   セレクタ文字列 or DOM 要素
 */
function renderImages(productId, container) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container) return;
  container.innerHTML = '';

  var srcs = getImages(productId);
  srcs.forEach(function (src) {
    var img = document.createElement('img');
    img.src     = src;
    img.alt     = productId;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = function () { this.remove(); };
    container.appendChild(img);
  });
}
