# ロールバック手順

## フロントエンド（GitHub Pages）

```bash
# 直前のコミットに戻す
git revert HEAD --no-edit
git push origin main

# 特定コミットに戻す
git log --oneline -10        # コミットハッシュ確認
git revert {hash} --no-edit
git push origin main
```

---

## VPS（main.py）

```bash
# バックアップから復元
cp ~/app/main.py.bak ~/app/main.py
sudo systemctl restart uvicorn

# バックアップ作成（作業前に必ず実行）
cp ~/app/main.py ~/app/main.py.bak
```

---

## Googleフィード再生成前チェック

```bash
curl -s https://api.tcdashop.com/feeds/google-shopping.xml | grep -c "<item>"
# → 103件であることを確認してから作業
```

---

## feature branch運用ルール

- 大規模変更は必ずbranchを切る
```bash
git checkout -b feature/{作業名}
git push origin feature/{作業名}
```

- 確認後にmainにマージ
```bash
git checkout main
git merge feature/{作業名}
git push origin main
```

---

## DBバックアップ（VPS）

```bash
# 手動バックアップ
pg_dump sairen_db > ~/backup/sairen_db_$(date +%Y%m%d).sql

# 自動バックアップ: 毎日02:30（backup_db.py）
```

---

## 緊急時チェックリスト

- [ ] uvicorn稼働確認: `sudo systemctl status uvicorn`
- [ ] フィード件数確認: `curl .../feeds/google-shopping.xml | grep -c "<item>"`
- [ ] DB接続確認: `psql sairen_db -c "SELECT COUNT(*) FROM products;"`
- [ ] フロント表示確認: tcdashop.com
- [ ] API確認: `curl https://api.tcdashop.com/health`
