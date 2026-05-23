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
npm run build       # output → ../docs/
git add docs/ && git push origin main   # GitHub Pages auto-deploy
```

VPS API restart:
```bash
ssh vps-sairen
pkill -f 'uvicorn main:app'
cd ~/app && source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 >> uvicorn.log 2>&1 &
```

Admin panel deploy:
```bash
cd TCDA_Admin
npm run build
npx wrangler pages deploy dist --project-name tcda-admin
```

## PWA

- Mode: `injectManifest` (vite-plugin-pwa 1.3.0)
- Source SW: `tcda/src/sw.ts` — Workbox precache + push handler + notificationclick
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

12言語対応: ja / en / zh / ko / fr / de / es / it / pt / ar / hi

翻訳ファイル: `tcda/public/locales/{lang}/translation.json`
（`docs/locales/` はビルド出力のコピー、直接編集しない）

## Design tokens

```
background : #080808
accent     : #c8ff00
border     : var(--color-border)
font-body  : var(--font-body)
text-cap   : var(--text-caption)
tracking   : var(--ls-nav)
```
