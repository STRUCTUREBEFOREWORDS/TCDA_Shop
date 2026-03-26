/**
 * TCDA — サイズ自動生成＋提案システム
 *
 * 差し込み場所:
 *   products/chroma-noise-jacket.html の </body> 直前に追加:
 *     <script src="../js/sizeSystem.js" defer></script>
 *
 *   js/script.js の TCDAPrintful.initProductPage() 呼び出し直後に追加:
 *     if (window.TCDASizeSystem) TCDASizeSystem.runSizeSystem();
 *
 * 依存:
 *   printful.js（TCDAPrintful.getProduct / getSizeChart）が先に読み込まれていること
 */

(function (global) {
  "use strict";

  /* ── 1. 商品タイプ判定 ──────────────────────────────────────── */

  /**
   * sync_product.name を使ってタイプ文字列を返す。
   *
   * @param  {object} apiData  getProduct() の返却値 {sync_product, sync_variants}
   * @returns {"tshirt_mens"|"hoodie_zip_unisex"|"shoes_unisex"|"unknown"}
   */
  function detectProductType(apiData) {
    const name = String(apiData?.sync_product?.name ?? "");
    if (/Crew Neck T-Shirt/i.test(name)) return "tshirt_mens";
    if (/Zip Hoodie/i.test(name))        return "hoodie_zip_unisex";
    if (/Slip-On/i.test(name))           return "shoes_unisex";
    return "unknown";
  }

  /* ── 2. Printfulデータ正規化 ────────────────────────────────── */

  /**
   * getSizeChart() の返却値（カタログサイズチャート）を
   * 扱いやすいオブジェクト配列に変換する。
   *
   * Printful sync_variants はサイズラベルのみ保持するため、
   * 実寸データは /products/{catalogId}/sizes エンドポイントから取得する。
   * parseFloat で "47 cm" → 47 に数値化する。
   *
   * @param  {object} sizeChartData  getSizeChart() の返却値 {size_tables: [...]}
   * @returns {Array<{size:string, chest:number|null, length:number|null, sleeve:number|null, foot_length:number|null}>}
   */
  function normalizePrintfulData(sizeChartData) {
    if (
      !sizeChartData ||
      !Array.isArray(sizeChartData.size_tables) ||
      !sizeChartData.size_tables.length
    ) {
      return [];
    }

    // cm テーブルを優先。なければ最初のテーブルを使用
    const table =
      sizeChartData.size_tables.find((t) => t.unit === "cm") ??
      sizeChartData.size_tables[0];

    if (
      !table ||
      !Array.isArray(table.sizes) ||
      !Array.isArray(table.measurements)
    ) {
      return [];
    }

    // Printful の ref 値 → 正規化キー のマッピング
    const REF_MAP = {
      chest:         "chest",
      chest_width:   "chest",
      body_length:   "length",
      length:        "length",
      sleeve_length: "sleeve",
      sleeve:        "sleeve",
      foot_length:   "foot_length",
      insole_length: "foot_length",
    };

    return table.sizes
      .map((size) => {
        const row = {
          size: String(size.size_label ?? size.name ?? ""),
          chest:       null,
          length:      null,
          sleeve:      null,
          foot_length: null,
        };

        if (Array.isArray(size.values)) {
          for (const val of size.values) {
            const key = REF_MAP[String(val.ref ?? "").toLowerCase()];
            if (key && row[key] === null) {
              // "47 cm" → 47、"47" → 47
              row[key] = parseFloat(String(val.value ?? "")) || null;
            }
          }
        }

        return row;
      })
      .filter((row) => row.size !== "");
  }

  /* ── 3. サイズテンプレート定義 ──────────────────────────────── */

  /**
   * 商品タイプごとのヘッダーとデータキーを定義する。
   * headers[0] は常に "サイズ" 列（コードで付与するため keys には含めない）。
   */
  const SIZE_TEMPLATES = {
    tshirt_mens: {
      headers: ["サイズ", "身幅", "着丈", "袖丈"],
      keys:    ["chest", "length", "sleeve"],
    },
    hoodie_zip_unisex: {
      headers: ["サイズ", "身幅", "着丈", "袖丈"],
      keys:    ["chest", "length", "sleeve"],
    },
    shoes_unisex: {
      headers: ["サイズ", "足長"],
      keys:    ["foot_length"],
    },
  };

  /* ── 4. サイズ表生成 ────────────────────────────────────────── */

  /**
   * タイプと正規化データから {headers, rows} を生成する。
   * rows の各要素: ["M", "51cm", "72cm", "65cm"]
   *
   * @param  {string} type  detectProductType() の返却値
   * @param  {Array}  data  normalizePrintfulData() の返却値
   * @returns {{headers:string[], rows:string[][]}}
   */
  function buildSizeTable(type, data) {
    const template = SIZE_TEMPLATES[type];
    if (!template || !data.length) {
      return { headers: [], rows: [] };
    }

    const rows = data.map((item) => {
      const cells = [item.size];
      for (const key of template.keys) {
        const val = item[key];
        cells.push(val !== null ? `${val}cm` : "—");
      }
      return cells;
    });

    return { headers: template.headers.slice(), rows };
  }

  /* ── 5. サイズ表レンダリング ────────────────────────────────── */

  /**
   * buildSizeTable() の出力を既存の .size-chart <table> 要素に書き込む。
   * thead / tbody 構造が必要（既存 HTML の構造をそのまま使用）。
   *
   * @param  {HTMLTableElement} tableEl    document.querySelector(".size-chart")
   * @param  {{headers:string[], rows:string[][]}} tableData  buildSizeTable() の返却値
   * @returns {boolean}  書き込み成功なら true
   */
  function renderTable(tableEl, tableData) {
    if (!tableEl || !tableData.headers.length || !tableData.rows.length) {
      return false;
    }

    const thead = tableEl.querySelector("thead tr");
    const tbody = tableEl.querySelector("tbody");
    if (!thead || !tbody) return false;

    thead.innerHTML = tableData.headers
      .map((h) => `<th>${esc(h)}</th>`)
      .join("");

    tbody.innerHTML = tableData.rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`
      )
      .join("");

    tableEl.dataset.source = "tcda-size-system";
    return true;
  }

  /* ── 6. サイズ提案ロジック ──────────────────────────────────── */

  /**
   * ユーザー入力から最適サイズを返す。
   *
   * 胸囲未入力時の推定式: chest = weight * 0.9 + 50
   * ゆとり (ease): tight=2 / regular=6 / loose=10
   * 判定: target = chest + ease を最初に超えるサイズを返す
   *
   * @param  {{height:number, weight:number, chest?:number, fit?:"tight"|"regular"|"loose"}} userInput
   * @param  {Array} normalizedData  normalizePrintfulData() の返却値
   * @returns {string|null}  サイズ名。データ不足の場合 null
   */
  function recommendSize(userInput, normalizedData) {
    const { weight, chest, fit = "regular" } = userInput;

    const EASE = { tight: 2, regular: 6, loose: 10 };
    const ease = EASE[fit] ?? 6;

    // 胸囲推定（未入力時）
    const bodyChest = (chest != null && chest > 0) ? chest : weight * 0.9 + 50;
    const target = bodyChest + ease;

    // chest データが存在する行のみ対象
    const withChest = normalizedData.filter((item) => item.chest !== null);
    if (!withChest.length) return null;

    // target を超える最初のサイズを返す
    for (const item of withChest) {
      if (item.chest >= target) return item.size;
    }

    // 全サイズを超える場合は最大サイズを返す
    return withChest[withChest.length - 1].size;
  }

  /* ── 7. UI出力 ──────────────────────────────────────────────── */

  /**
   * 推奨サイズを #sizeResult 要素に表示し、
   * 対応する .size-btn の aria-pressed を更新する。
   *
   * @param {string|null} size  recommendSize() の返却値
   * @param {string}      fit   "tight"|"regular"|"loose"
   */
  function renderRecommendation(size, fit) {
    const el = document.getElementById("sizeResult");
    if (!el) return;

    if (!size) {
      el.innerHTML =
        `<p class="size-rec-note">測定データが不足しているため提案できません。</p>`;
      return;
    }

    const fitLabels = { tight: "タイト", regular: "レギュラー", loose: "ゆったり" };
    const fitLabel  = fitLabels[fit] ?? "レギュラー";

    el.innerHTML =
      `<div class="size-rec-result">` +
      `<p class="size-rec-label">推奨サイズ</p>` +
      `<p class="size-rec-value">${esc(size)}</p>` +
      `<p class="size-rec-note">フィット感：${esc(fitLabel)}</p>` +
      `</div>`;

    // 対応するサイズボタンのフォーカス状態を更新
    document.querySelectorAll(".size-btn").forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.textContent.trim() === size ? "true" : "false"
      );
    });
  }

  /* ── 8. 推奨フォームのイベント設定（内部） ──────────────────── */

  /**
   * #sizeRecommendForm の submit イベントを設定する。
   * @param {Array} normalizedData  normalizePrintfulData() の返却値
   */
  function _setupRecommendForm(normalizedData) {
    const form = document.getElementById("sizeRecommendForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const weight = parseFloat(
        form.querySelector("[name='weight']")?.value ?? "0"
      );
      const chestRaw = parseFloat(
        form.querySelector("[name='chest']")?.value ?? ""
      );
      const fit =
        form.querySelector("[name='fit']:checked")?.value ?? "regular";

      if (!weight || weight <= 0) return;

      const userInput = {
        weight,
        chest:
          Number.isFinite(chestRaw) && chestRaw > 0 ? chestRaw : undefined,
        fit,
      };

      const size = recommendSize(userInput, normalizedData);
      renderRecommendation(size, fit);
    });
  }

  /* ── 9. 統合処理 ────────────────────────────────────────────── */

  /**
   * サイズシステム全体を実行する。
   *
   * 処理順:
   *   1. URL / DOM からsync product ID を取得
   *   2. getProduct() で apiData を取得
   *   3. detectProductType() でタイプ判定
   *   4. getSizeChart() でカタログサイズデータを取得
   *   5. normalizePrintfulData() で正規化
   *   6. buildSizeTable() でサイズ表データ生成
   *   7. renderTable() で .size-chart に書き込み
   *      （printful.js が先に renderSizeChart を実行済みの場合はスキップ）
   *   8. _setupRecommendForm() でフォームリスナー設定
   *
   * @param {object} [apiData]  省略時は URL パラメータから自動取得
   */
  async function runSizeSystem(apiData) {
    if (!global.TCDAPrintful) return;

    // 1. apiData が渡されていない場合は自動取得
    if (!apiData) {
      const params = new URLSearchParams(global.location.search);
      const syncId =
        params.get("printfulId") ||
        params.get("productId") ||
        document.querySelector("[data-product-id]")?.dataset.printfulSyncId;
      if (!syncId) return;
      apiData = await global.TCDAPrintful.getProduct(syncId);
    }

    if (!apiData) return;

    // 2. タイプ判定
    const type = detectProductType(apiData);

    // 3. カタログIDの取得
    const firstVariant = apiData.sync_variants?.[0] ?? null;
    const catalogId =
      firstVariant?.product?.product_id ??
      firstVariant?.catalog_product_id ??
      null;

    if (!catalogId) return;

    // 4. カタログサイズチャート取得
    const sizeChartData = await global.TCDAPrintful.getSizeChart(catalogId);
    if (!sizeChartData) return;

    // 5. 正規化
    const normalized = normalizePrintfulData(sizeChartData);
    if (!normalized.length) return;

    // 6. サイズ表生成
    const tableData = buildSizeTable(type, normalized);

    // 7. renderTable（printful.js が既に renderSizeChart を実行済みの場合はスキップ）
    const tableEl = document.querySelector(".size-chart");
    if (tableEl && tableEl.dataset.source !== "printful" && tableData.headers.length) {
      renderTable(tableEl, tableData);
    }

    // 8. 推奨フォームのリスナー設定
    _setupRecommendForm(normalized);
  }

  /* ── ユーティリティ ─────────────────────────────────────────── */

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ── Public API ─────────────────────────────────────────────── */

  global.TCDASizeSystem = {
    detectProductType,
    normalizePrintfulData,
    buildSizeTable,
    renderTable,
    recommendSize,
    runSizeSystem,
  };
})(window);
