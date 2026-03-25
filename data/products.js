/**
 * TCDA — 商品マスターデータ
 *
 * ブラウザ:  window.ProductsData.products / window.ProductsData.getProductById()
 * Node.js:  const { products, getProductById } = require('./data/products.js')
 *
 * 商品追加は tools/create-product.js を使用（または直接この配列に追記）
 * 画像は /products/{id}/main.jpg, sub1.jpg, sub2.jpg ... に配置
 */

(function () {
  const products = [
    // ─── 既存商品（専用HTMLページあり）───────────────────────────────
    {
      id: "tcda-cnj-001",
      name: "Chroma Noise Jacket",
      price: 74000,
      category: "outer",
      image: "images/product-chroma-jacket.webp",
      page: "products/chroma-noise-jacket.html",
      variant_ids: { S: 0, M: 0, L: 0, XL: 0 },
    },
    {
      id: "tcda-csj-001",
      name: "Chroma Signal Jacket",
      price: 8900,
      category: "outer",
      image: "images/product-chroma-jacket.webp",
      page: "products/unisex-jacket.html",
      variant_ids: { S: 0, M: 0, L: 0, XL: 0 },
    },
    {
      id: "tcda-pts-001",
      name: "Prism Noise T-shirt",
      price: 4900,
      category: "tshirt",
      image: "images/product-prism-shirt.webp",
      page: "products/mens-tshirt.html",
      variant_ids: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0 },
    },
    {
      id: "tcda-svt-001",
      name: "Spectral Veil T-shirt",
      price: 4900,
      category: "tshirt",
      image: "images/product-spectral-dress.webp",
      page: "products/womens-tshirt.html",
      variant_ids: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0 },
    },
    // ─── テンプレートベース商品（product.html?id= で表示）────────────
    {
      id: "hoodie01",
      name: "Hoodie 01",
      price: 8900,
      category: "outer",
      image: "products/hoodie01/main.jpg",
      page: "products/product.html?id=hoodie01",
      variant_ids: { S: 0, M: 0, L: 0, XL: 0 },
    },
    {
      id: "hoodie02",
      name: "Hoodie 02",
      price: 8900,
      category: "outer",
      image: "products/hoodie02/main.jpg",
      page: "products/product.html?id=hoodie02",
      variant_ids: { S: 0, M: 0, L: 0, XL: 0 },
    },
    {
      id: "hoodie03",
      name: "Hoodie 03",
      price: 8900,
      category: "outer",
      image: "products/hoodie03/main.jpg",
      page: "products/product.html?id=hoodie03",
      variant_ids: { S: 0, M: 0, L: 0, XL: 0 },
    },
    {
      id: "mens-tshirt01",
      name: "Mens T-shirt 01",
      price: 4900,
      category: "tshirt",
      image: "products/mens-tshirt01/main.jpg",
      page: "products/product.html?id=mens-tshirt01",
      variant_ids: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0 },
    },
  ];

  // ── ヘルパー関数 ─────────────────────────────────────────────────

  function getProductById(id) {
    return products.find(function (p) { return p.id === id; }) || null;
  }

  function findProductByVariantId(variantId) {
    for (var i = 0; i < products.length; i++) {
      var product = products[i];
      var sizes = Object.keys(product.variant_ids || {});
      for (var j = 0; j < sizes.length; j++) {
        if (product.variant_ids[sizes[j]] === variantId) {
          return { product: product, size: sizes[j] };
        }
      }
    }
    return null;
  }

  // ── エクスポート（Node.js / ブラウザ 両対応）────────────────────

  var api = { products: products, getProductById: getProductById, findProductByVariantId: findProductByVariantId };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    window.ProductsData = api;
  }
})();
