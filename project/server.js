require('dotenv').config();
const express = require('express');
const Stripe  = require('stripe');
const https   = require('https');
const path    = require('path');
const fs      = require('fs');

const app    = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const STORE  = process.env.PRINTFUL_STORE_ID || '17873034';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/ambient-count', (req, res) => {
  const dir = path.join(__dirname, 'public', 'images', '\u30b5\u30a4\u30c8\u5168\u4f53\u7528');
  try {
    const count = fs.readdirSync(dir)
      .filter(f => /^img1-\d{3}\.webp$/.test(f)).length;
    res.json({ count });
  } catch { res.json({ count: 0 }); }
});

app.get('/api/products', async (req, res) => {
  try {
    const list = await pf('/store/products?limit=100');
    const products = await Promise.all(list.result.map(async sp => {
      const d = await pf('/store/products/' + sp.id);
      const v = d.result.sync_variants[0];
      return {
        id:            sp.id,
        thumbnail_url: sp.thumbnail_url,
        price:         Math.round(parseFloat(v.retail_price)),
        currency:      v.currency,
        variant_id:    v.id,
      };
    }));
    res.json({ products });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post('/create-checkout-session', async (req, res) => {
  const { price, tag, variant_id } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'jpy', unit_amount: price,
        product_data: { name: tag } }, quantity: 1 }],
      mode:        'payment',
      success_url: process.env.DOMAIN + '/success.html',
      cancel_url:  process.env.DOMAIN + '/cancel.html',
    });
    res.json({ url: session.url });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

function pf(p) {
  return new Promise((ok, ng) => {
    https.get({ hostname: 'api.printful.com', path: p,
      headers: { Authorization: 'Bearer ' + process.env.PRINTFUL_API_KEY,
                 'X-PF-Store-Id': STORE } },
      r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }
    ).on('error', ng);
  });
}

app.listen(3000);
