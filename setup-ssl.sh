#!/usr/bin/env bash
# ============================================================
# api.tcdashop.com SSL 証明書セットアップスクリプト
# 実行方法: sudo bash setup-ssl.sh
# ============================================================
set -euo pipefail

DOMAIN="api.tcdashop.com"
EMAIL="info@tcdashop.com"   # ← 必要に応じて変更してください
CONF_SRC="$(dirname "$0")/api.tcdashop.com.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"

echo "=== [1/5] certbot のインストール確認 ==="
if ! command -v certbot &>/dev/null; then
    echo "certbot をインストール中..."
    apt-get update -qq
    apt-get install -y certbot python3-certbot-nginx
else
    echo "certbot は既にインストール済みです: $(certbot --version)"
fi

echo ""
echo "=== [2/5] Nginx 設定ファイルを配置 ==="
cp "${CONF_SRC}" "${NGINX_AVAILABLE}"
echo "配置完了: ${NGINX_AVAILABLE}"

if [ ! -L "${NGINX_ENABLED}" ]; then
    ln -s "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
    echo "シンボリックリンク作成: ${NGINX_ENABLED}"
fi

echo ""
echo "=== [3/5] Nginx 設定テスト & リロード ==="
nginx -t
systemctl reload nginx
echo "Nginx リロード完了"

echo ""
echo "=== [4/5] SSL 証明書取得 (certbot --nginx) ==="
certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    --redirect \
    -d "${DOMAIN}"

echo ""
echo "=== [5/5] 自動更新タイマーの確認 ==="
# certbot のインストール時に systemd タイマーまたは cron が自動設定される
if systemctl is-enabled certbot.timer &>/dev/null; then
    echo "systemd タイマーが有効:"
    systemctl status certbot.timer --no-pager | head -6
elif crontab -l 2>/dev/null | grep -q certbot; then
    echo "cron による自動更新が設定済みです"
else
    echo "自動更新 cron を手動で追加します..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -
    echo "cron 追加完了 (毎日 03:00 に更新チェック)"
fi

echo ""
echo "=== 完了 ==="
echo "証明書の確認:"
certbot certificates
echo ""
echo "Nginx 設定確認:"
nginx -T | grep -A5 "server_name ${DOMAIN}"
