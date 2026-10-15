# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# TCDA Shop — Development Guide

## Architecture

| Layer | Tech | URL |
|---|---|---|
| Frontend (SPA) | React + Vite → GitHub Pages | tcdashop.com |
| API | FastAPI (Python) on VPS | api.tcdashop.com |
| DB | PostgreSQL (sairen_db) | VPS localhost:5432 |
| Images | Cloudflare R2 + CDN | cdn.tcdashop.com |
| Admin panel | React + Vite → Cloudflare Pages | tcda-admin.pages.dev |

## Build & Deploy

```bash
# Frontend
cd tcda
npm run dev         # vite dev server
npm run build       # generate-sitemap.js + vite build → ../docs/ (committed)
git add docs/ && git push origin main   # GitHub Pages auto-deploy
```

There is no test runner or linter configured.

`docs/` is the committed build output that GitHub Pages serves (`.github/workflows/deploy.yml` just uploads it — CI does not build). Always rebuild and commit `docs/` after changing `tcda/src` or `tcda/public`.

VPS API restart (see infra rules below — never `pkill` over SSH, never bind 0.0.0.0):
```bash
ssh -t tcda "sudo systemctl restart uvicorn"
```

Admin panel deploy:
```bash
cd TCDA_Admin
npm run build
npx wrangler pages deploy dist --project-name tcda-admin
```

## PWA

- Mode: `injectManifest` (vite-plugin-pwa 1.3.0)
- Source SW: `tcda/src/sw-v2.ts` — Workbox precache + push handler + notificationclick
- Output: `docs/sw.js`, `docs/manifest.webmanifest`
- Icons: `public/icon192.png` (192×192), `public/icon512.png` (512×512)
- Start URL: `/ja/collection`
- Theme: `#080808`

**Note:** vite-plugin-pwa と esbuild は `tcda/node_modules` にのみインストールすること。
ルート `node_modules` に入れると vite 8 のビルドエラーが発生する。

## Push通知

### VAPID keys（変更不要）

| Key | 場所 |
|---|---|
| Public Key | `tcda/.env` → `VITE_VAPID_PUBLIC_KEY` |
| Private Key | VPS `~/app/.env` → `VAPID_PRIVATE_KEY` |

Public key: `BDmLZg82lFXaU9QP3A9w_9ZHN10tO_izVC2yDJ3IGzi3gArLv0oPtuXrcp_5lXEPz53JeBZPu7jBv4ktoU4xkd8`

### フロントエンド

- 購読フック: `tcda/src/app/hooks/usePushSubscription.ts`
- UI: `Footer.tsx` の SNS アイコン下に購読ボタン
- 購読情報は `localStorage('push_subscribed')` でキャッシュ

### VPS API

| Endpoint | 認証 | 説明 |
|---|---|---|
| `POST /push/subscribe` | なし | 購読情報を DB に保存 |
| `POST /push/send` | `X-Internal-Key` | 全購読者に送信 |

DB テーブル: `push_subscriptions (id, endpoint, p256dh, auth, lang, created_at)`

VPS の `pywebpush` は `~/app/venv` 内にインストール済み。

### 管理画面から送信

tcda-admin.pages.dev → サイドバー「Push通知 → 通知送信」

### INTERNAL_API_KEY

VPS `~/app/.env` の `INTERNAL_API_KEY` と
Admin `TCDA_Admin/.env` の `VITE_INTERNAL_KEY` は同一値でなければならない。

## i18n

11言語対応: ja / en / zh / ko / fr / de / es / it / pt / ar / hi（`Language` 型は `tcda/src/app/types.ts`。言語リストは `app/i18n.ts`・`context/AppContext.tsx`・`workers/ogp-worker/src/index.js` にも重複して書かれているので、言語を追加するときは全て更新）

翻訳ファイル: `tcda/public/locales/{lang}/translation.json`
（`docs/locales/` はビルド出力のコピー、直接編集しない）

- ja が原文。`npx ts-node scripts/translate.ts [lang...]`（リポジトリルート、`ANTHROPIC_API_KEY` 必要）が ja から en/fr/es/ko/zh のみを再生成する。de/it/pt/ar/hi は対象外
- `app/data/translations.ts` と `app/utils/translations.ts` は旧来のインライン翻訳（後者は en/es/fr/ja のみ）。新規文言は locales JSON に追加する

## Frontend structure

- `tcda/` は Vite + React 18 + Tailwind 4 の SPA。エイリアス `@` → `tcda/src`。
- ルーティングは `app/routes.tsx`（react-router 7 `createBrowserRouter`）。全ページは `/:lang/...` 配下で `Root.tsx` が言語を設定。`/product/:id` など言語なしパスは `/en/...` へリダイレクト
- GitHub Pages は SPA fallback 非対応のため、`vite.config.ts` の `spaPlugin` が `docs/404.html`（→ `/?redirect=` で復帰）と `index.html` の復元スクリプトを生成する。ルーティングを変えるときはこの仕組みを壊さない
- i18n は `app/i18n.ts`（i18next + HTTP backend、`/locales/{lng}/translation.json?v=BUILD_VERSION`）。初期言語は URL の先頭セグメントから決定
- グローバル状態は `context/AppContext.tsx`（言語・通貨・価格換算）。通貨は `api.tcdashop.com/country` で判定し、`/exchange-rates` のレートで換算（失敗時は固定レートにフォールバック）。価格は JPY 基準
- データは API 経由: `/products`（`hooks/useProducts.ts`, `ArchivePage`）、`/size-charts/by-product/{printfulProductId}`、`/create-checkout-session`（Stripe、`utils/stripe.ts`）、`/events`（`utils/analytics.ts`）、`/newsletter/subscribe`。`app/data/products.ts` はデモ用の静的データ
- 画像は `utils/imageUtils.ts` で `cdn.tcdashop.com` の `.webp` 派生版を参照する

## Other components in this repo

- `workers/ogp-worker/` — Cloudflare Worker（`tcdashop.com/*` にルート）。クローラ UA の場合のみ `api.tcdashop.com/products/{id}` から OGP メタを生成して返す。デプロイは `wrangler deploy`
- `api/` — VPS の FastAPI のうち push 通知部分（`push/router.py`, `migration.sql`）のみのコピー。`.gitignore` に `api/` があるが一部は追跡済み。API 本体（`main.py`）はこのリポジトリになく VPS の `~/app` にある
- `scrape_size_chart.py` / `size_charts.json` — サイズ表のスクレイピング用ワンオフスクリプトとその出力
- `tcda/STRIPE_INTEGRATION.md` — 古い Stripe 導入ガイド（現行実装とは異なる可能性あり）

## Design tokens

```
background : #080808
accent     : #c8ff00
border     : var(--color-border)
font-body  : var(--font-body)
text-cap   : var(--text-caption)
tracking   : var(--ls-nav)
```

## インフラ運用ルール（2026-09-24 更新）
- 開発端末は Mac Studio（~/dev/TCDA_Shop, ~/dev/TCDA_Admin）。VPS 接続は `ssh tcda` のみ（IP 直書き・旧鍵は廃止）
- uvicorn は `127.0.0.1:8000` でのみ待ち受ける。`--host 0.0.0.0` に戻さない
- nginx の proxy_pass は `http://127.0.0.1:8000`（`localhost` 表記にしない）
- nginx は Cloudflare 以外からの接続を deny している（IP 一覧は毎月自動更新）。VPS の IP に直接アクセスして動作確認しない（403 になる）。確認は https://api.tcdashop.com 経由、または VPS 内で `curl http://127.0.0.1:8000`
- API の再起動は `ssh -t tcda "sudo systemctl restart uvicorn"`。SSH 経由で `pkill -f 'uvicorn main:app'` を使わない（自分のシェルも止まる）
- 内部認証の判定は必ず `if not x_internal_key or x_internal_key != INTERNAL_API_KEY`
- VPS の `.env` は chmod 600。`.env.save` などのバックアップを残さない
- VPS のメモリは 2GB。VS Code Remote-SSH で VPS に接続しない（VS Code Server が約 1.2GB 消費した実績あり）
- このリポジトリは公開。IP アドレス・鍵・トークンをコミットしない。`.claude/settings*.json`、`.env`、`.dev.vars`、サービスアカウントの JSON は Git 管理外
- フロントエンド（tcda/src）は環境変数（import.meta.env）を使っていない

## Rules
- pip install は --break-system-packages 必須（VPS）
- wrangler の R2 アップロードは --remote 必須
- 商品詳細ページのURLは /{lang}/product/{uuid}（単数形）。/{lang}/products は一覧ページで正しい
