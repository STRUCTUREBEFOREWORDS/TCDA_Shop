/**
 * TCDA — 商品マスターデータ
 *
 * ブラウザ:  window.ProductsData.products / window.ProductsData.getProductById()
 * Node.js:  const { products, getProductById } = require('./data/products.js')
 *
 * variant_ids は scripts/sync-variant-ids.js で自動取得・更新可能
 * printful_id  : Printful 上の sync_product.id（確認用）
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
      printful_id: 424275426,
      variant_ids: {
        "2XS": 5236394895,
        "XS":  5236394896,
        "S":   5236394897,
        "M":   5236394898,
        "L":   5236394899,
        "XL":  5236394900,
        "2XL": 5236394901,
      },
    },
    {
      id: "tcda-csj-001",
      name: "Chroma Signal Jacket",
      price: 8900,
      category: "outer",
      image: "images/product-chroma-jacket.webp",
      page: "products/unisex-jacket.html",
      printful_id: 424275382,
      variant_ids: {
        "2XS": 5236394603,
        "XS":  5236394604,
        "S":   5236394605,
        "M":   5236394606,
        "L":   5236394607,
        "XL":  5236394608,
        "2XL": 5236394609,
      },
    },
    {
      id: "tcda-pts-001",
      name: "Prism Noise T-shirt",
      price: 4900,
      category: "tshirt",
      image: "images/product-prism-shirt.webp",
      page: "products/mens-tshirt.html",
      printful_id: 424252402,
      variant_ids: {
        "XS":  5236263305,
        "S":   5236263306,
        "M":   5236263307,
        "L":   5236263308,
        "XL":  5236263309,
        "2XL": 5236263310,
      },
    },
    {
      id: "tcda-svt-001",
      name: "Spectral Veil T-shirt",
      price: 4900,
      category: "tshirt",
      image: "images/product-spectral-dress.webp",
      page: "products/womens-tshirt.html",
      printful_id: 424274987,
      variant_ids: {
        "XS":  5236374964,
        "S":   5236374965,
        "M":   5236374966,
        "L":   5236374967,
        "XL":  5236374968,
        "2XL": 5236374969,
      },
    },
    // ─── テンプレートベース商品（product.html?id= で表示）────────────
    {
      id: "hoodie01",
      name: "Hoodie 01",
      price: 8900,
      category: "outer",
      image: "products/hoodie01/main.jpg",
      page: "products/product.html?id=hoodie01",
      printful_id: 424275171,
      variant_ids: {
        "2XS": 5236381209,
        "XS":  5236381210,
        "S":   5236381211,
        "M":   5236381212,
        "L":   5236381213,
        "XL":  5236381214,
        "2XL": 5236381215,
      },
    },
    {
      id: "hoodie02",
      name: "Hoodie 02",
      price: 8900,
      category: "outer",
      image: "products/hoodie02/main.jpg",
      page: "products/product.html?id=hoodie02",
      printful_id: 424275319,
      variant_ids: {
        "2XS": 5236393974,
        "XS":  5236393975,
        "S":   5236393976,
        "M":   5236393977,
        "L":   5236393978,
        "XL":  5236393979,
        "2XL": 5236393980,
      },
    },
    {
      id: "hoodie03",
      name: "Hoodie 03",
      price: 8900,
      category: "outer",
      image: "products/hoodie03/main.jpg",
      page: "products/product.html?id=hoodie03",
      printful_id: 424275370,
      variant_ids: {
        "2XS": 5236394474,
        "XS":  5236394475,
        "S":   5236394476,
        "M":   5236394477,
        "L":   5236394478,
        "XL":  5236394479,
        "2XL": 5236394480,
      },
    },
    {
      id: "mens-tshirt01",
      name: "Mens T-shirt 01",
      price: 4900,
      category: "tshirt",
      image: "products/mens-tshirt01/main.jpg",
      page: "products/product.html?id=mens-tshirt01",
      printful_id: 424261670,
      variant_ids: {
        "XS":  5236288893,
        "S":   5236288894,
        "M":   5236288895,
        "L":   5236288896,
        "XL":  5236288897,
        "2XL": 5236288898,
      },
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
