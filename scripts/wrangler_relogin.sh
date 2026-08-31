#!/bin/bash
# wrangler認証切れ復旧（2026-07-26確立の手順のスクリプト化）
# 非対話環境でOAuth URLを取り出して表示する。
# 出力されたURLを社長に渡し、Cloudflareの同意画面（アカウント=umubura@gmail.com）で
# 青い「Authorize」を押してもらう。押下後、このスクリプトが whoami で成功を確認する。
set -uo pipefail
cd "$(dirname "$0")/.."

LOG=$(mktemp)
npx wrangler login > "$LOG" 2>&1 &
LOGIN_PID=$!

URL=""
for _ in $(seq 1 15); do
  sleep 2
  URL=$(grep -o 'https://dash.cloudflare.com/oauth2/auth[^ ]*' "$LOG" | head -1 || true)
  [ -n "$URL" ] && break
done

if [ -z "$URL" ]; then
  echo "エラー: OAuth URLを取得できませんでした。ログ:"
  cat "$LOG"
  kill "$LOGIN_PID" 2>/dev/null
  exit 1
fi

echo "──────────────────────────────────────────"
echo "このURLをブラウザで開いて「Authorize」を押してください:"
echo ""
echo "$URL"
echo ""
echo "──────────────────────────────────────────"
echo "押下を待っています（最大5分）..."

for _ in $(seq 1 60); do
  sleep 5
  if npx wrangler whoami >/dev/null 2>&1; then
    echo "✅ 認証成功。デプロイ可能です。"
    exit 0
  fi
done
echo "タイムアウト: まだ認証されていません。Authorize後にもう一度 npx wrangler whoami で確認してください。"
exit 1
