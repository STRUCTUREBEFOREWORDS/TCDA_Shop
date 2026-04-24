# TCDA Shop — Rollback Handbook

## 1. Git Tag でスナップショット作成

デプロイ前に必ずタグを打つ。

```bash
# 日付タグ（例: v20260424）
git tag v$(date +%Y%m%d)
git push origin v$(date +%Y%m%d)

# 任意のラベル付き
git tag v20260424-before-nav-refactor
git push origin v20260424-before-nav-refactor

# タグ一覧確認
git tag -l | sort -r | head -10

# 特定タグの内容確認
git show v20260424 --stat
```

---

## 2. GitHub Pages Rollback

GitHub Pages は `docs/` ディレクトリを直接配信しているため、`main` ブランチの `docs/` を戻せば即時反映される。

### 方法A — git revert（推奨・履歴を残す）

```bash
# 直前のコミットを revert
git revert HEAD --no-edit
git push origin main

# 特定コミットを revert
git log --oneline -10   # 対象コミットハッシュを確認
git revert <hash> --no-edit
git push origin main
```

### 方法B — タグから復元（完全ロールバック）

```bash
# タグ時点の docs/ を現在のブランチに復元
git checkout v20260424 -- docs/
git add docs/
git commit -m "rollback: restore docs/ to v20260424"
git push origin main
```

### 方法C — フロントエンドのみ再ビルド

```bash
cd tcda
git checkout v20260424 -- src/
npm run build
cd ..
git add docs/
git commit -m "rollback: rebuild from v20260424 source"
git push origin main
```

> Cloudflare CDN のキャッシュが残る場合は Dashboard > Caching > Purge Everything を実行。

---

## 3. VPS main.py バックアップ

```bash
# バックアップ作成（デプロイ前に実行）
cp ~/app/main.py ~/app/main.py.bak.$(date +%Y%m%d)

# バックアップ一覧確認
ls -lh ~/app/main.py.bak.*

# ロールバック（特定日付に戻す）
cp ~/app/main.py.bak.20260424 ~/app/main.py
sudo systemctl restart uvicorn
# または
pkill -f uvicorn
nohup uvicorn main:app --host 0.0.0.0 --port 8000 &

# 動作確認
curl https://api.tcdashop.com/rates
```

古いバックアップの削除（30日以上前）:

```bash
find ~/app -name "main.py.bak.*" -mtime +30 -delete
```

---

## 4. DB バックアップ確認

バックアップは `backup_db.py` が毎日 **02:30** に cron 実行される。

```bash
# cron 設定確認
crontab -l | grep backup

# バックアップファイル確認
ls -lh ~/backups/ | tail -10

# 最新バックアップの整合性チェック
pg_restore --list ~/backups/sairen_db_$(date +%Y%m%d).dump | head -20

# 手動バックアップ実行
python3 ~/app/backup_db.py

# リストア手順（緊急時のみ）
pg_restore -d sairen_db ~/backups/sairen_db_YYYYMMDD.dump
```

---

## 5. Google フィード再生成前チェックリスト

Google Merchant Center / Shopping フィードを再生成する前に以下を確認する。

```
[ ] 1. 為替レートAPIが正常に返答しているか
        curl https://api.tcdashop.com/rates
        → 全通貨（JPY/USD/EUR/GBP/KRW/CNY/AUD/SGD/BRL/CAD/AED）が返っているか

[ ] 2. 商品APIが全件返答しているか
        curl https://api.tcdashop.com/products | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d),'products')"
        → 商品数が期待値と一致しているか

[ ] 3. 在庫ステータスが正確か（OutOfStock商品が正しく反映されているか）
        curl https://api.tcdashop.com/products/<id> | python3 -c "import json,sys; p=json.load(sys.stdin); print('stock:', p['stock'])"

[ ] 4. 価格フォーマットが正しいか（JPY整数・他通貨小数点2桁）
        → フィード内の <g:price> が "12000 JPY" / "89.99 USD" 形式になっているか

[ ] 5. 画像URLが全商品で有効か（cdn.tcdashop.com が応答しているか）
        curl -I https://cdn.tcdashop.com/products/<id>/<image>.webp
        → HTTP 200 が返るか

[ ] 6. フィード生成スクリプトのdry-runを先に実行
        python3 ~/app/generate_feed.py --dry-run | head -30

[ ] 7. 生成後、Google Merchant Center でフィード検証を実行
        → エラー0件・警告のみであることを確認してから承認
```
