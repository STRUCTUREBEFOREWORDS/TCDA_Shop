const express = require('express');
const multer = require('multer');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const productsPath = () => path.join(config.siteRoot, 'data', 'products.json');
const imgDir = (id) => path.join(config.siteRoot, 'products', id);

// SSE
let clients = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  clients.push(res);
  req.on('close', () => { clients = clients.filter(c => c !== res); });
});

function broadcast(event, data) {
  clients.forEach(c => c.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

let watcher = null;
function watchProducts() {
  if (watcher) { watcher.close(); watcher = null; }
  const p = productsPath();
  if (!fs.existsSync(p)) return;
  watcher = chokidar.watch(p, { ignoreInitial: true });
  watcher.on('change', () => broadcast('reload', {}));
}
watchProducts();

// Dynamic image serving from siteRoot
app.get('/site-img/*', (req, res) => {
  const rel = req.params[0];
  const fp = path.join(config.siteRoot, rel);
  res.sendFile(fp, err => { if (err) res.status(404).end(); });
});

// Multer — reads config at request time
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const d = imgDir(req.params.id);
    fs.mkdirSync(d, { recursive: true });
    cb(null, d);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Config
app.get('/api/config', (req, res) => res.json(config));

app.post('/api/config', (req, res) => {
  config = { ...config, ...req.body };
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  watchProducts();
  res.json({ ok: true });
});

// Products — proxy to Cloudflare Worker KV (single source of truth)
app.get('/api/products', async (req, res) => {
  try {
    const r = await fetch(`${config.worker_url}/api/products`);
    const d = await r.json();
    res.status(r.status).json(d);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Full list replace (drag-reorder, bulk ops)
app.post('/api/products', async (req, res) => {
  try {
    const r = await fetch(`${config.worker_url}/api/products-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const d = await r.json();
    res.status(r.status).json(d);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Single product upsert
app.post('/api/product-update', async (req, res) => {
  try {
    const r = await fetch(`${config.worker_url}/api/product-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const d = await r.json();
    res.status(r.status).json(d);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(productsPath(), 'utf8'));
    const product = data.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Rename image folder when ID changes
app.post('/api/products/:oldId/rename/:newId', (req, res) => {
  try {
    const oldPath = imgDir(req.params.oldId);
    const newPath = imgDir(req.params.newId);
    if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Images
app.get('/api/images/:id', (req, res) => {
  try {
    const d = imgDir(req.params.id);
    if (!fs.existsSync(d)) return res.json({ files: [] });
    const files = fs.readdirSync(d).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    res.json({ files });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/products/:id/images', upload.array('images'), (req, res) => {
  const files = req.files.map(f => `products/${req.params.id}/${f.filename}`);
  res.json({ files });
});

app.delete('/api/products/:id/images/:filename', (req, res) => {
  try {
    const fp = path.join(imgDir(req.params.id), req.params.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/products/:id/folder', (req, res) => {
  try {
    const d = imgDir(req.params.id);
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Printful verify (legacy — kept for compatibility)
app.post('/api/printful/verify/:printfulId', async (req, res) => {
  try {
    if (!config.printful_api_key) return res.status(400).json({ error: 'APIキーが未設定です' });
    const r = await fetch(`https://api.printful.com/sync/products/${req.params.printfulId}`, {
      headers: { 'Authorization': `Bearer ${config.printful_api_key}`, 'X-PF-Store-Id': config.printful_store_id }
    });
    const d = await r.json();
    if (r.ok) res.json({ ok: true, data: d.result });
    else res.status(400).json({ error: d.error?.message || '商品が見つかりません' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Printful product detail (full — sync_product + sync_variants)
app.get('/api/printful/product/:printfulId', async (req, res) => {
  try {
    if (!config.printful_api_key) return res.status(400).json({ error: 'APIキーが未設定です' });
    const r = await fetch(`https://api.printful.com/sync/products/${req.params.printfulId}`, {
      headers: { 'Authorization': `Bearer ${config.printful_api_key}`, 'X-PF-Store-Id': config.printful_store_id }
    });
    const d = await r.json();
    if (r.ok) res.json({ ok: true, data: d.result });
    else res.status(400).json({ error: d.error?.message || '商品が見つかりません' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Printful product list
app.get('/api/printful/list', async (req, res) => {
  try {
    if (!config.printful_api_key) return res.status(400).json({ error: 'APIキーが未設定です' });
    const r = await fetch('https://api.printful.com/sync/products', {
      headers: { 'Authorization': `Bearer ${config.printful_api_key}`, 'X-PF-Store-Id': config.printful_store_id }
    });
    const d = await r.json();
    if (r.ok) res.json({ ok: true, products: d.result || [] });
    else res.status(400).json({ error: d.error?.message || 'リスト取得失敗' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Printful full sync → Cloudflare Worker
app.post('/api/printful/sync', async (req, res) => {
  try {
    if (!config.worker_url) return res.status(400).json({ error: 'worker_url が未設定です' });
    const r = await fetch(`${config.worker_url}/api/printful-sync?force=1`);
    const d = await r.json();
    res.status(r.status).json(d);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Deploy: git add → commit → push
app.get('/api/deploy/status', (req, res) => {
  const cmd = `cd "${config.siteRoot}" && git status --short && echo "---" && git log --oneline -5`;
  exec(cmd, (err, stdout, stderr) => {
    res.json({ output: stdout || stderr, error: err?.message });
  });
});

app.post('/api/deploy', (req, res) => {
  const { message } = req.body;
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const msg = (message || '商品情報更新') + ` [${ts}]`;
  const siteRoot = config.siteRoot;

  const cmd = [
    `cd "${siteRoot}"`,
    `git add data/products.json products/`,
    `git diff --cached --quiet && echo "NOTHING_TO_COMMIT" || git commit -m "${msg.replace(/"/g, "'")}"`,
    `git push`,
  ].join(' && ');

  exec(cmd, { timeout: 60000 }, (err, stdout, stderr) => {
    const output = [stdout, stderr].filter(Boolean).join('\n').trim();
    if (output.includes('NOTHING_TO_COMMIT')) {
      return res.json({ ok: true, skipped: true, output: '変更なし（コミット不要）\n\n' + output });
    }
    if (err && !output.includes('NOTHING_TO_COMMIT')) {
      return res.status(500).json({ error: err.message, output });
    }
    res.json({ ok: true, output });
  });
});

app.listen(config.port, () => {
  console.log(`TCDA 商品管理: http://localhost:${config.port}`);

  // 起動時に Printful 自動同期（3秒後、サーバー完全起動後に実行）
  if (config.worker_url) {
    setTimeout(async () => {
      try {
        const r = await fetch(`${config.worker_url}/api/printful-sync?force=1`);
        const d = await r.json();
        if (d.ok) {
          console.log(`[Printful] 起動時同期完了 — ${d.synced}件取得, ${d.removed ?? 0}件削除`);
          broadcast('pf-synced', { synced: d.synced, removed: d.removed ?? 0, ts: Date.now() });
        } else {
          console.warn('[Printful] 起動時同期スキップ:', d.message || JSON.stringify(d));
        }
      } catch (e) {
        console.warn('[Printful] 起動時同期エラー:', e.message);
      }
    }, 3000);
  }
});
