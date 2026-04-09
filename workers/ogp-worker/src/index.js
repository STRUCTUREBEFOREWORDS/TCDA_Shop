const CRAWLERS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot',
  'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLERS.some(bot => ua.includes(bot));
}

async function getProductOGP(productId) {
  const res = await fetch(`https://api.tcdashop.com/products/${productId}`);
  if (!res.ok) return null;
  return await res.json();
}

function buildOGPHtml(product) {
  const title = `${product.name} | TCDA`;
  const description = product.fabric_composition || 'Transcend Color Digital Apparel — アートを着る、感性を解放する。';
  const image = product.images?.[0] || product.thumbnail_url;
  const url = `https://tcdashop.com/product/${product.id}`;
  const price = product.price;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="TCDA" />
  <meta property="product:price:amount" content="${price}" />
  <meta property="product:price:currency" content="JPY" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <link rel="canonical" href="${url}" />
</head>
<body>
  <p>Redirecting...</p>
  <script>window.location.href = "${url}";</script>
</body>
</html>`;
}

function buildDefaultOGPHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>TCDA | アートを着る、感性を解放する</title>
  <meta name="description" content="Transcend Color Digital Apparel — あなたの内側にある表現をファッションとして可視化するブランド。" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="TCDA | アートを着る、感性を解放する" />
  <meta property="og:description" content="Transcend Color Digital Apparel — あなたの内側にある表現をファッションとして可視化するブランド。" />
  <meta property="og:url" content="https://tcdashop.com/" />
  <meta property="og:image" content="https://cdn.tcdashop.com/top/1.jpg" />
  <meta property="og:site_name" content="TCDA" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="TCDA | アートを着る、感性を解放する" />
  <meta name="twitter:image" content="https://cdn.tcdashop.com/top/1.jpg" />
</head>
<body>
  <p>Redirecting...</p>
  <script>window.location.href = "https://tcdashop.com/";</script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const userAgent = request.headers.get('User-Agent') || '';
    const url = new URL(request.url);

    // クローラー以外はそのままGitHub Pagesへ
    if (!isCrawler(userAgent)) {
      return fetch(request);
    }

    // 商品ページの場合
    const productMatch = url.pathname.match(/^\/product\/([a-f0-9-]+)$/);
    if (productMatch) {
      const productId = productMatch[1];
      const product = await getProductOGP(productId);
      if (product) {
        return new Response(buildOGPHtml(product), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        });
      }
    }

    // その他のページ
    return new Response(buildDefaultOGPHtml(), {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};
