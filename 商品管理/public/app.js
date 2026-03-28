// ─── State ───────────────────────────────────────────────────────────────────
const S = {
  products: [],
  config: {},
  editProduct: null,
  originalId: null,
  isNew: false,
  images: [],              // ["products/id/file.jpg", ...]
  verifyStatus: {},        // { id: 'ok'|'error'|'unknown' }
  dragImgSrcIdx: null,
  dragCardSrcIdx: null,
};

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiFetch(method, url, body) {
  const opts = { method, headers: {} };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(url, opts);
  return r.json();
}
const apiGet  = (url)        => apiFetch('GET',    url);
const apiPost = (url, body)  => apiFetch('POST',   url, body);
const apiDel  = (url)        => apiFetch('DELETE', url);

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector(`.nav-tab[data-tab="${name}"]`).classList.add('active');
  if (name === 'json') renderJSON();
}

// ─── Load data ───────────────────────────────────────────────────────────────
async function loadProducts() {
  const data = await apiGet('/api/products');
  S.products = data.products || [];
  renderDashboard();
}

async function loadConfig() {
  S.config = await apiGet('/api/config');
  fillConfigForm();
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function renderDashboard() {
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('product-count');
  count.textContent = `(${S.products.length}件)`;
  grid.innerHTML = '';

  S.products.forEach((p, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.draggable = true;
    card.dataset.idx = index;

    const imgPath = p.images && p.images[0] ? `/site-img/${p.images[0]}` : null;
    const vs = S.verifyStatus[p.id];
    const badgeCls = vs === 'ok' ? 'badge-ok' : vs === 'error' ? 'badge-error' : 'badge-unknown';
    const badgeTxt = vs === 'ok' ? '✓ 確認済' : vs === 'error' ? '✗ エラー' : '？ 未確認';

    card.innerHTML = `
      <div class="product-card-img">
        <label class="card-check-wrap" onclick="event.stopPropagation()">
          <input type="checkbox" class="card-check" data-id="${esc(p.id)}">
        </label>
        ${imgPath
          ? `<img src="${imgPath}" alt="" loading="lazy" onerror="this.parentElement.textContent='No Image'">`
          : 'No Image'}
      </div>
      <div class="product-card-body">
        <div class="product-card-name">${esc(p.name?.ja || p.id)}</div>
        <div class="product-card-price">¥${(p.price || 0).toLocaleString()}</div>
        <div class="product-card-pf">PF: ${p.printful_id || '—'}</div>
        <span class="badge ${badgeCls}">${badgeTxt}</span>
      </div>`;

    // Click to edit (not when dragging)
    card.addEventListener('click', () => openEdit(p));

    // Checkbox selection
    const chk = card.querySelector('.card-check');
    chk.addEventListener('change', () => {
      card.classList.toggle('selected', chk.checked);
      updateBulkActions();
    });

    // Drag reorder
    card.addEventListener('dragstart', e => {
      S.dragCardSrcIdx = index;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => card.classList.add('dragging'), 0);
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('dragover', e => {
      e.preventDefault();
      card.classList.add('card-drag-target');
    });
    card.addEventListener('dragleave', e => {
      if (!card.contains(e.relatedTarget)) card.classList.remove('card-drag-target');
    });
    card.addEventListener('drop', async e => {
      e.preventDefault();
      card.classList.remove('card-drag-target');
      const src = S.dragCardSrcIdx;
      if (src !== null && src !== index) {
        const arr = [...S.products];
        const [moved] = arr.splice(src, 1);
        arr.splice(index, 0, moved);
        S.products = arr;
        renderDashboard();
        await apiPost('/api/products', { products: S.products });
        toast('並び順を保存しました', 'success');
      }
    });

    grid.appendChild(card);
  });

  updateBulkActions();
}

// ─── Bulk actions ─────────────────────────────────────────────────────────────
function getSelectedIds() {
  return Array.from(document.querySelectorAll('.card-check:checked')).map(c => c.dataset.id);
}

function updateBulkActions() {
  const n = document.querySelectorAll('.card-check:checked').length;
  const btn = document.getElementById('btn-bulk-price');
  if (n > 0) {
    btn.textContent = `一括価格変更（${n}件）`;
    btn.style.display = '';
  } else {
    btn.style.display = 'none';
  }
}

function openBulkPriceModal() {
  const ids = getSelectedIds();
  if (!ids.length) return;
  document.getElementById('bulk-select-count').textContent = ids.length;
  document.getElementById('bulk-value').value = '';
  updateBulkPreview();
  document.getElementById('modal-bulk-price').classList.remove('hidden');
}

function calcNewPrice(price, type, value) {
  const v = parseFloat(value);
  if (isNaN(v)) return price;
  if (type === 'fixed')   return Math.max(0, Math.round(v));
  if (type === 'percent') return Math.max(0, Math.round(price * (1 + v / 100)));
  if (type === 'amount')  return Math.max(0, Math.round(price + v));
  return price;
}

function updateBulkPreview() {
  const ids   = getSelectedIds();
  const type  = document.getElementById('bulk-type').value;
  const value = document.getElementById('bulk-value').value;

  const rows = ids.map(id => {
    const p = S.products.find(pr => pr.id === id);
    if (!p) return '';
    const np = calcNewPrice(p.price || 0, type, value);
    const changed = value !== '' && np !== (p.price || 0);
    return `<tr>
      <td>${esc(p.name?.ja || id)}</td>
      <td>¥${(p.price || 0).toLocaleString()}</td>
      <td class="${changed ? 'price-changed' : ''}">¥${np.toLocaleString()}</td>
    </tr>`;
  }).join('');

  document.getElementById('bulk-preview').innerHTML = `
    <table class="bulk-preview-table">
      <thead><tr><th>商品名</th><th>現在価格</th><th>変更後</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function applyBulkPrice() {
  const ids   = getSelectedIds();
  const type  = document.getElementById('bulk-type').value;
  const value = document.getElementById('bulk-value').value;
  if (value === '') { toast('値を入力してください', 'error'); return; }

  const products = S.products.map(p =>
    ids.includes(p.id) ? { ...p, price: calcNewPrice(p.price || 0, type, value) } : p
  );
  const r = await apiPost('/api/products', { products });
  if (r.ok) {
    document.getElementById('modal-bulk-price').classList.add('hidden');
    await loadProducts();
    toast(`${ids.length}件の価格を変更しました`, 'success');
  } else {
    toast('保存に失敗しました', 'error');
  }
}

// ─── Duplicate product ────────────────────────────────────────────────────────
function duplicateProduct() {
  const id = document.getElementById('f-id').value;
  const p  = S.products.find(pr => pr.id === id);
  if (!p) { toast('先に商品を保存してください', 'error'); return; }

  let newId = id + '-copy';
  let n = 2;
  while (S.products.some(pr => pr.id === newId)) newId = id + '-copy' + n++;

  const copy    = JSON.parse(JSON.stringify(p));
  copy.id       = newId;
  copy.images   = [];

  S.editProduct = copy;
  S.originalId  = null;
  S.isNew       = true;
  S.images      = [];
  fillEditForm(copy);
  document.getElementById('edit-title').textContent = '複製: ' + (p.name?.ja || id);
  document.getElementById('btn-delete').style.display    = 'none';
  document.getElementById('btn-duplicate').style.display = 'none';
  toast(`「${newId}」として複製 — 保存してください`);
}

// ─── Edit ─────────────────────────────────────────────────────────────────────
function openEdit(product) {
  S.editProduct = JSON.parse(JSON.stringify(product));
  S.originalId  = product.id;
  S.isNew       = false;
  S.images      = [...(product.images || [])];
  fillEditForm(S.editProduct);
  showTab('edit');
  document.getElementById('edit-title').textContent = product.name?.ja || product.id;
  document.getElementById('btn-delete').style.display    = '';
  document.getElementById('btn-duplicate').style.display = '';
}

function openNew() {
  S.editProduct = {
    id: '', printful_id: null,
    name: { ja: '', en: '' },
    description: { ja: '', en: '' },
    material: '', price: 0,
    category: 'tshirt', segment: 'mens',
    sizes: [], images: [],
  };
  S.originalId = null;
  S.isNew      = true;
  S.images     = [];
  fillEditForm(S.editProduct);
  showTab('edit');
  document.getElementById('edit-title').textContent = '新規商品';
  document.getElementById('btn-delete').style.display    = 'none';
  document.getElementById('btn-duplicate').style.display = 'none';
}

function fillEditForm(p) {
  setVal('f-id',          p.id || '');
  setVal('f-printful-id', p.printful_id || '');
  setVal('f-name-ja',     p.name?.ja || '');
  setVal('f-name-en',     p.name?.en || '');
  setVal('f-desc-ja',     p.description?.ja || '');
  setVal('f-desc-en',     p.description?.en || '');
  setVal('f-material',    p.material || '');
  setVal('f-price',       p.price || '');
  setVal('f-category',    p.category || 'tshirt');
  setVal('f-segment',     p.segment || 'mens');
  renderSizes(p.sizes || []);
  renderImages();
}

function setVal(id, val) { document.getElementById(id).value = val; }

// ─── Sizes ────────────────────────────────────────────────────────────────────
function renderSizes(sizes) {
  document.getElementById('sizes-body').innerHTML = '';
  sizes.forEach(s => appendSizeRow(s));
}

function appendSizeRow(s = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text"   value="${esc(s.size   || '')}" placeholder="M"></td>
    <td><input type="number" value="${s.chest  || ''}"  placeholder="96"></td>
    <td><input type="number" value="${s.length || ''}"  placeholder="71"></td>
    <td><input type="number" value="${s.sleeve || ''}"  placeholder=""></td>
    <td><button type="button" class="btn btn-danger btn-sm">×</button></td>`;
  tr.querySelector('button').addEventListener('click', () => tr.remove());
  document.getElementById('sizes-body').appendChild(tr);
}

function getSizes() {
  return Array.from(document.querySelectorAll('#sizes-body tr')).map(tr => {
    const inp = tr.querySelectorAll('input');
    if (!inp[0].value.trim()) return null;
    const s = { size: inp[0].value.trim() };
    if (inp[1].value) s.chest  = parseInt(inp[1].value);
    if (inp[2].value) s.length = parseInt(inp[2].value);
    if (inp[3].value) s.sleeve = parseInt(inp[3].value);
    return s;
  }).filter(Boolean);
}

// ─── Images ───────────────────────────────────────────────────────────────────
function renderImages() {
  const mainWrap = document.getElementById('image-main-preview');
  const grid     = document.getElementById('image-grid');

  if (!S.images.length) {
    mainWrap.innerHTML = '<div class="no-image-placeholder">No Image</div>';
    grid.innerHTML = '';
    return;
  }

  mainWrap.innerHTML = `<img src="/site-img/${S.images[0]}" alt="">`;
  grid.innerHTML = '';

  S.images.forEach((imgPath, i) => {
    const item = document.createElement('div');
    item.className = 'img-item';
    item.draggable = true;
    item.dataset.idx = i;

    const filename = imgPath.split('/').pop();
    item.innerHTML = `
      <img src="/site-img/${imgPath}" alt="" loading="lazy">
      <span class="img-idx">${i + 1}</span>
      <button class="img-del" title="削除">×</button>`;

    // Drag reorder
    item.addEventListener('dragstart', e => {
      S.dragImgSrcIdx = i;
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', e => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const src = S.dragImgSrcIdx;
      if (src !== null && src !== i) {
        const arr = [...S.images];
        const [moved] = arr.splice(src, 1);
        arr.splice(i, 0, moved);
        S.images = arr;
        renderImages();
      }
    });

    // Delete
    item.querySelector('.img-del').addEventListener('click', async e => {
      e.stopPropagation();
      const id = document.getElementById('f-id').value;
      if (id) {
        const r = await apiDel(`/api/products/${encodeURIComponent(id)}/images/${encodeURIComponent(filename)}`);
        if (!r.ok) { toast('削除に失敗しました', 'error'); return; }
      }
      S.images.splice(i, 1);
      renderImages();
      toast('画像を削除しました');
    });

    grid.appendChild(item);
  });
}

// ─── Image upload ─────────────────────────────────────────────────────────────
function setupDropZone() {
  const zone  = document.getElementById('drop-zone');
  const input = document.getElementById('image-file-input');

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    await uploadFiles(e.dataTransfer.files);
  });

  document.getElementById('btn-file-select').addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    await uploadFiles(input.files);
    input.value = '';
  });
}

async function uploadFiles(files) {
  const id = document.getElementById('f-id').value.trim();
  if (!id) { toast('先にIDを入力してください', 'error'); return; }

  const fd = new FormData();
  Array.from(files).forEach(f => fd.append('images', f));

  const r = await apiFetch('POST', `/api/products/${encodeURIComponent(id)}/images`, fd);
  if (r.files) {
    S.images.push(...r.files);
    renderImages();
    toast(`${r.files.length}枚アップロードしました`, 'success');
  } else {
    toast('アップロードに失敗しました', 'error');
  }
}

// ─── Save product ─────────────────────────────────────────────────────────────
async function saveProduct() {
  const newId = document.getElementById('f-id').value.trim();
  if (!newId) { toast('IDを入力してください', 'error'); return; }
  if (!document.getElementById('f-name-ja').value.trim()) {
    toast('商品名（日本語）を入力してください', 'error');
    return;
  }

  let images = [...S.images];

  // Handle ID rename
  if (!S.isNew && S.originalId && S.originalId !== newId) {
    const r = await apiPost(
      `/api/products/${encodeURIComponent(S.originalId)}/rename/${encodeURIComponent(newId)}`,
      {}
    );
    if (!r.ok) { toast('フォルダのリネームに失敗しました', 'error'); return; }
    images = images.map(p => p.replace(`products/${S.originalId}/`, `products/${newId}/`));
  }

  // Fetch existing product to preserve fields not in the form (e.g. variant_ids, size_template)
  const existing = S.products.find(p => p.id === S.originalId) || {};

  const product = {
    variant_ids: {},
    ...existing,
    id:          newId,
    printful_id: parseInt(document.getElementById('f-printful-id').value) || existing.printful_id || null,
    name: {
      ja: document.getElementById('f-name-ja').value,
      en: document.getElementById('f-name-en').value,
    },
    images,
    description: {
      ja: document.getElementById('f-desc-ja').value,
      en: document.getElementById('f-desc-en').value,
    },
    material:  document.getElementById('f-material').value,
    price:     parseInt(document.getElementById('f-price').value) || 0,
    category:  document.getElementById('f-category').value,
    segment:   document.getElementById('f-segment').value,
    sizes:     getSizes(),
  };

  const r = await apiPost('/api/product-update', product);
  if (r.ok) {
    S.originalId = newId;
    S.isNew      = false;
    S.images     = images;
    await loadProducts();
    toast('保存しました', 'success');
    document.getElementById('edit-title').textContent = product.name.ja || newId;
    document.getElementById('btn-delete').style.display = '';
  } else {
    toast(r.error || '保存に失敗しました', 'error');
  }
}

// ─── Delete product ───────────────────────────────────────────────────────────
function openDeleteModal() {
  const id   = document.getElementById('f-id').value;
  const name = document.getElementById('f-name-ja').value;
  document.getElementById('modal-delete-name').textContent = `${name || id} (${id})`;
  document.getElementById('modal-delete-folder').checked = false;
  document.getElementById('modal-delete').classList.remove('hidden');
}

async function confirmDelete() {
  const id           = document.getElementById('f-id').value;
  const deleteFolder = document.getElementById('modal-delete-folder').checked;
  document.getElementById('modal-delete').classList.add('hidden');

  const data = await apiGet('/api/products');
  const products = (data.products || []).filter(p => p.id !== id);
  const r = await apiPost('/api/products', { products });

  if (!r.ok) { toast('削除に失敗しました', 'error'); return; }
  if (deleteFolder) await apiDel(`/api/products/${encodeURIComponent(id)}/folder`);

  delete S.verifyStatus[id];
  await loadProducts();
  toast('削除しました');
  showTab('dashboard');
}

// ─── Printful ─────────────────────────────────────────────────────────────────

// 同期ステータスUIを更新
function updatePfSyncStatus(synced, ts) {
  const el = document.getElementById('pf-sync-status');
  if (!el) return;
  const time = new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  el.textContent = `PF: ${time} (${synced}件)`;
}

// Printful フルシンク（Worker経由）
async function syncFromPrintful() {
  const btn = document.getElementById('btn-pf-sync');
  if (btn) { btn.disabled = true; btn.textContent = '同期中...'; }
  const indicator = document.getElementById('sync-indicator');
  indicator.classList.remove('hidden');

  try {
    const r = await apiPost('/api/printful/sync', {});
    if (r.ok) {
      await loadProducts();
      updatePfSyncStatus(r.synced, Date.now());
      const msg = r.removed > 0
        ? `Printful同期完了 — ${r.synced}件取得, ${r.removed}件削除`
        : `Printful同期完了 — ${r.synced}件取得`;
      toast(msg, 'success');
    } else {
      toast(r.error || 'Printful同期に失敗しました', 'error');
    }
  } catch (e) {
    toast('Printful同期エラー: ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Printful同期'; }
    indicator.classList.add('hidden');
  }
}

// 10分ごとに自動同期
function startAutoSync() {
  setInterval(syncFromPrintful, 10 * 60 * 1000);
}

// Printfulから取得 — 全フィールド補完
async function fetchFromPrintful() {
  const pfId = document.getElementById('f-printful-id').value.trim();
  if (!pfId) { toast('Printful IDを入力してください', 'error'); return; }

  const indicator = document.getElementById('sync-indicator');
  indicator.classList.remove('hidden');

  try {
    const r = await apiGet(`/api/printful/product/${pfId}`);
    if (!r.ok || !r.data) {
      toast(r.error || 'Printful取得に失敗しました', 'error');
      return;
    }

    const sp       = r.data.sync_product;
    const variants = r.data.sync_variants || [];

    // 英語名（未入力なら補完）
    const enInput = document.getElementById('f-name-en');
    if (!enInput.value && sp.name) enInput.value = sp.name;

    // 価格（未入力なら補完）
    const priceInput = document.getElementById('f-price');
    if (!priceInput.value) {
      const prices = variants.map(v => parseFloat(v.retail_price || 0)).filter(Boolean);
      if (prices.length) priceInput.value = Math.round(Math.min(...prices));
    }

    // サムネイル → 画像リストに追加（まだなければ）
    if (sp.thumbnail_url && !S.images.includes(sp.thumbnail_url)) {
      // プレビュー画像（CDN）を画像候補として表示
      const previewUrls = [];
      if (sp.thumbnail_url) previewUrls.push(sp.thumbnail_url);
      variants.forEach(v => (v.files || []).forEach(f => {
        if (f.type === 'preview' && f.preview_url && !previewUrls.includes(f.preview_url))
          previewUrls.push(f.preview_url);
      }));
      // 既存画像がなければCDN URLをセット
      if (!S.images.length && previewUrls.length) {
        S.images = previewUrls;
        renderImages();
      }
    }

    const filled = [];
    if (!enInput.value && sp.name) filled.push('英語名');
    if (!document.getElementById('f-price').value) filled.push('価格');

    toast(`Printful取得成功 — ${variants.length}バリアント同期済み`, 'success');
  } catch (e) {
    toast('Printful取得エラー: ' + e.message, 'error');
  } finally {
    indicator.classList.add('hidden');
  }
}

async function verifyAll() {
  const targets = S.products.filter(p => p.printful_id);
  if (!targets.length) { toast('Printful IDが設定された商品がありません'); return; }

  toast(`Printfulと同期中 (${targets.length}件)...`);
  await syncFromPrintful();
}

// ─── Config ───────────────────────────────────────────────────────────────────
function fillConfigForm() {
  setVal('cfg-siteroot', S.config.siteRoot || '');
  setVal('cfg-apikey',   S.config.printful_api_key || '');
  setVal('cfg-storeid',  S.config.printful_store_id || '');
  setVal('cfg-port',     S.config.port || 4000);
}

async function saveConfig() {
  const r = await apiPost('/api/config', {
    siteRoot:            document.getElementById('cfg-siteroot').value,
    printful_api_key:    document.getElementById('cfg-apikey').value,
    printful_store_id:   document.getElementById('cfg-storeid').value,
  });
  if (r.ok) {
    await loadConfig();
    await loadProducts();
    toast('設定を保存しました', 'success');
  } else {
    toast('保存に失敗しました', 'error');
  }
}

// ─── JSON Preview ─────────────────────────────────────────────────────────────
async function renderJSON() {
  const data = await apiGet('/api/products');
  const json = JSON.stringify(data, null, 2);
  document.getElementById('json-preview').innerHTML = syntaxHighlight(json);
}

function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => {
        let cls = 'json-num';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-str';
        } else if (/true|false/.test(match)) {
          cls = 'json-bool';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

// ─── Size import ─────────────────────────────────────────────────────────────
let parsedSizeRows = [];

// 列名の正規化マップ
const COL_ALIASES = {
  size:   ['size', 'サイズ', 'sz'],
  chest:  ['chest', '胸囲', 'bust', 'バスト', 'width', '幅'],
  length: ['length', '着丈', 'body length', 'bodylength', '丈'],
  sleeve: ['sleeve', '袖丈', 'sleeve length', 'sleevelength'],
};

function detectCol(header) {
  const h = header.toLowerCase().trim();
  for (const [key, aliases] of Object.entries(COL_ALIASES)) {
    if (aliases.some(a => h.includes(a))) return key;
  }
  return null;
}

function parseRawText(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return null;

  // 区切り文字を自動判定（タブ優先）
  const delim = lines[0].includes('\t') ? '\t' : ',';

  const rows = lines.map(l =>
    l.split(delim).map(c => c.trim().replace(/^["']|["']$/g, ''))
  );

  // ヘッダー行の検出（最初の行が数字を含まない = ヘッダー）
  let headers = [];
  let dataStart = 0;
  const firstRow = rows[0];
  const isHeader = firstRow.some(c => isNaN(parseFloat(c)) && c !== '');
  if (isHeader) {
    headers = firstRow.map(detectCol);
    dataStart = 1;
  } else {
    // ヘッダーなし → 列順: size, chest, length, sleeve と仮定
    headers = ['size', 'chest', 'length', 'sleeve'];
    dataStart = 0;
  }

  const sizes = [];
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(c => !c)) continue; // 空行スキップ

    const entry = {};
    headers.forEach((key, j) => {
      if (!key || j >= row.length) return;
      const val = row[j].trim();
      if (!val) return;
      if (key === 'size') entry.size = val;
      else {
        const n = parseFloat(val);
        if (!isNaN(n)) entry[key] = n;
      }
    });
    if (entry.size) sizes.push(entry);
  }
  return sizes;
}

function openSizeImportModal() {
  parsedSizeRows = [];
  document.getElementById('size-paste-area').value = '';
  document.getElementById('size-col-map').style.display = 'none';
  document.getElementById('size-import-input').classList.remove('hidden');
  document.getElementById('size-import-preview').classList.add('hidden');
  document.getElementById('modal-size-import').classList.remove('hidden');
}

function showSizePreview(rows) {
  if (!rows || !rows.length) {
    toast('データを認識できませんでした。形式を確認してください', 'error');
    return;
  }
  parsedSizeRows = rows;
  document.getElementById('size-preview-count').textContent = rows.length;

  const tbody = document.getElementById('size-preview-body');
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${esc(r.size || '')}</td>
      <td>${r.chest  ?? '—'}</td>
      <td>${r.length ?? '—'}</td>
      <td>${r.sleeve ?? '—'}</td>
    </tr>`).join('');

  document.getElementById('size-import-input').classList.add('hidden');
  document.getElementById('size-import-preview').classList.remove('hidden');
}

function applySizeImport() {
  renderSizes(parsedSizeRows);
  document.getElementById('modal-size-import').classList.add('hidden');
  toast(`${parsedSizeRows.length}行のサイズデータを取り込みました`, 'success');
}

function exportSizeCSV() {
  const sizes = getSizes();
  if (!sizes.length) { toast('サイズデータがありません', 'error'); return; }
  const header = 'Size,Chest,Length,Sleeve';
  const rows = sizes.map(s => [s.size, s.chest ?? '', s.length ?? '', s.sleeve ?? ''].join(','));
  const csv = [header, ...rows].join('\n');
  const id = document.getElementById('f-id').value || 'sizes';
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${id}-sizes.csv`;
  a.click();
}

function setupSizeImport() {
  const dropZone  = document.getElementById('size-drop-zone');
  const fileInput = document.getElementById('size-csv-input');
  const pasteArea = document.getElementById('size-paste-area');

  // ファイルドロップ
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) readSizeFile(file);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) readSizeFile(fileInput.files[0]);
    fileInput.value = '';
  });

  // テキスト貼り付け
  pasteArea.addEventListener('paste', () => {
    setTimeout(() => {
      const text = pasteArea.value;
      if (text.trim()) {
        const rows = parseRawText(text);
        if (rows && rows.length) showSizePreview(rows);
      }
    }, 50);
  });

  // ボタン
  document.getElementById('btn-size-import').addEventListener('click', openSizeImportModal);
  document.getElementById('btn-size-export').addEventListener('click', exportSizeCSV);
  document.getElementById('size-import-cancel').addEventListener('click', () =>
    document.getElementById('modal-size-import').classList.add('hidden')
  );
  document.getElementById('size-import-preview-btn').addEventListener('click', () => {
    const text = document.getElementById('size-paste-area').value;
    if (!text.trim()) { toast('データを入力してください', 'error'); return; }
    showSizePreview(parseRawText(text));
  });
  document.getElementById('size-preview-back').addEventListener('click', () => {
    document.getElementById('size-import-input').classList.remove('hidden');
    document.getElementById('size-import-preview').classList.add('hidden');
  });
  document.getElementById('size-preview-confirm').addEventListener('click', applySizeImport);
  document.getElementById('modal-size-import').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
}

function readSizeFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('size-paste-area').value = e.target.result;
    const rows = parseRawText(e.target.result);
    showSizePreview(rows);
  };
  reader.readAsText(file, 'UTF-8');
}

// ─── Deploy ──────────────────────────────────────────────────────────────────
function openDeployModal() {
  document.getElementById('deploy-message').value = '';
  document.getElementById('deploy-idle').classList.remove('hidden');
  document.getElementById('deploy-running').classList.add('hidden');
  document.getElementById('deploy-result').classList.add('hidden');
  document.getElementById('deploy-modal-title').textContent = 'tcdashop.com にデプロイ';
  document.getElementById('modal-deploy').classList.remove('hidden');
}

async function runDeploy() {
  const message = document.getElementById('deploy-message').value.trim();
  document.getElementById('deploy-idle').classList.add('hidden');
  document.getElementById('deploy-running').classList.remove('hidden');
  document.getElementById('deploy-result').classList.add('hidden');

  try {
    const r = await apiPost('/api/deploy', { message });
    document.getElementById('deploy-running').classList.add('hidden');
    document.getElementById('deploy-result').classList.remove('hidden');

    const icon = document.getElementById('deploy-result-icon');
    const msg  = document.getElementById('deploy-result-msg');
    const log  = document.getElementById('deploy-log');

    if (r.ok) {
      if (r.skipped) {
        icon.textContent = '⚠️';
        icon.className   = 'deploy-result-icon warn';
        msg.textContent  = '変更がないためコミットはスキップされました';
      } else {
        icon.textContent = '✅';
        icon.className   = 'deploy-result-icon success';
        msg.textContent  = 'Push完了！Cloudflare Pagesがビルドを開始しました（反映まで約1〜2分）';
      }
    } else {
      icon.textContent = '❌';
      icon.className   = 'deploy-result-icon error';
      msg.textContent  = 'エラーが発生しました';
    }
    log.textContent = r.output || r.error || '';
  } catch (e) {
    document.getElementById('deploy-running').classList.add('hidden');
    document.getElementById('deploy-result').classList.remove('hidden');
    document.getElementById('deploy-result-icon').textContent = '❌';
    document.getElementById('deploy-result-msg').textContent  = 'ネットワークエラー';
    document.getElementById('deploy-log').textContent         = e.message;
  }
}

async function showDeployStatus() {
  const r = await apiGet('/api/deploy/status');
  openDeployModal();
  document.getElementById('deploy-idle').classList.add('hidden');
  document.getElementById('deploy-result').classList.remove('hidden');
  document.getElementById('deploy-result-icon').textContent = '📋';
  document.getElementById('deploy-result-icon').className   = 'deploy-result-icon';
  document.getElementById('deploy-result-msg').textContent  = 'git status（ローカルの変更状況）';
  document.getElementById('deploy-log').textContent         = r.output || '変更なし';
  document.getElementById('deploy-modal-title').textContent = 'git status';
}

// ─── SSE ─────────────────────────────────────────────────────────────────────
function setupSSE() {
  const es = new EventSource('/api/events');
  es.addEventListener('reload', async () => {
    await loadProducts();
    toast('外部変更を検知 — 自動更新しました');
  });
  // サーバー起動時Printful同期完了イベント
  es.addEventListener('pf-synced', async (e) => {
    const d = JSON.parse(e.data);
    await loadProducts();
    updatePfSyncStatus(d.synced, d.ts);
    toast(`Printful同期完了 — ${d.synced}件取得`, 'success');
  });
  es.onerror = () => {};
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
function setupEvents() {
  // Nav
  document.querySelectorAll('.nav-tab').forEach(btn =>
    btn.addEventListener('click', () => showTab(btn.dataset.tab))
  );

  // Dashboard
  document.getElementById('btn-new').addEventListener('click', openNew);
  document.getElementById('btn-verify-all').addEventListener('click', verifyAll);
  document.getElementById('btn-bulk-price').addEventListener('click', openBulkPriceModal);

  // Edit
  document.getElementById('btn-save').addEventListener('click', saveProduct);
  document.getElementById('btn-delete').addEventListener('click', openDeleteModal);
  document.getElementById('btn-duplicate').addEventListener('click', duplicateProduct);
  document.getElementById('btn-printful-fetch').addEventListener('click', fetchFromPrintful);
  document.getElementById('btn-add-size').addEventListener('click', () => appendSizeRow());

  // Printful
  document.getElementById('btn-pf-sync').addEventListener('click', syncFromPrintful);

  // Deploy
  document.getElementById('btn-deploy').addEventListener('click', openDeployModal);
  document.getElementById('btn-deploy-status').addEventListener('click', showDeployStatus);
  document.getElementById('deploy-cancel').addEventListener('click', () =>
    document.getElementById('modal-deploy').classList.add('hidden')
  );
  document.getElementById('deploy-close').addEventListener('click', () =>
    document.getElementById('modal-deploy').classList.add('hidden')
  );
  document.getElementById('deploy-confirm').addEventListener('click', runDeploy);
  document.getElementById('modal-deploy').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });

  // Bulk price modal
  document.getElementById('bulk-modal-cancel').addEventListener('click', () =>
    document.getElementById('modal-bulk-price').classList.add('hidden')
  );
  document.getElementById('bulk-modal-confirm').addEventListener('click', applyBulkPrice);
  document.getElementById('modal-bulk-price').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
  document.getElementById('bulk-type').addEventListener('change', updateBulkPreview);
  document.getElementById('bulk-value').addEventListener('input', updateBulkPreview);

  // Settings
  document.getElementById('btn-save-config').addEventListener('click', saveConfig);

  // JSON
  document.getElementById('btn-copy-json').addEventListener('click', async () => {
    const data = await apiGet('/api/products');
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast('コピーしました', 'success');
  });

  // Modal
  document.getElementById('modal-cancel').addEventListener('click', () =>
    document.getElementById('modal-delete').classList.add('hidden')
  );
  document.getElementById('modal-confirm').addEventListener('click', confirmDelete);

  // Close modal on backdrop click
  document.getElementById('modal-delete').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  setupEvents();
  setupDropZone();
  setupSizeImport();
  setupSSE();
  await Promise.all([loadProducts(), loadConfig()]);
  startAutoSync();  // 10分ごとに定期同期
});
