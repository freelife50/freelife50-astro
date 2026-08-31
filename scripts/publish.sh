#!/bin/bash
# ブログ公開の定型フロー1コマンド版:
#   記事検証 → 画像サイズ最終ゲート → wrangler認証確認 → ビルド → デプロイ → キャッシュバスター付き本番確認
#
# 使い方:
#   scripts/publish.sh                                  # 検証〜デプロイのみ
#   scripts/publish.sh https://freelife50.com/slug/ https://en.freelife50.com/slug-en/
#                                                        # デプロイ後に本番URLを200確認
#   scripts/publish.sh --no-deploy [URL...]              # 検証だけ（テスト用）
set -euo pipefail
cd "$(dirname "$0")/.."

DEPLOY=1
URLS=()
for arg in "$@"; do
  case "$arg" in
    --no-deploy) DEPLOY=0 ;;
    *) URLS+=("$arg") ;;
  esac
done

echo "── 1/5 記事front matter検証（直近48h更新分）"
/usr/bin/python3 scripts/validate_articles.py

echo "── 2/5 画像サイズ最終ゲート（今月アップロード分・300KB超ゼロ確認）"
UPLOADS="public/images/wp-content/uploads/$(date +%Y/%m)"
if [ -d "$UPLOADS" ]; then
  OVERS=$(find "$UPLOADS" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.png' \) -size +300k)
  if [ -n "$OVERS" ]; then
    echo "エラー: 300KB超の画像あり。scripts/optimize_images.py で再圧縮してから再実行:"
    echo "$OVERS" | while read -r f; do echo "  $f ($(du -k "$f" | cut -f1)KB)"; done
    exit 1
  fi
  echo "OK: $UPLOADS に300KB超なし"
else
  echo "今月のuploadsディレクトリなし（$UPLOADS）→スキップ"
fi

if [ "$DEPLOY" -eq 0 ]; then
  echo "── --no-deploy 指定のためここで終了（検証のみ）"
  exit 0
fi

echo "── 3/5 wrangler認証確認"
if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "エラー: wrangler未認証（トークン期限切れ）。scripts/wrangler_relogin.sh を実行して"
  echo "出力されたOAuth URLを社長に渡し、Authorizeを押してもらってから再実行。"
  exit 1
fi
echo "OK: 認証あり"

echo "── 4/5 ビルド＆デプロイ"
npm run build
npx wrangler pages deploy dist --project-name freelife50-astro

echo "── 5/5 本番確認（キャッシュバスター付き）"
CB="cb=$(date +%s)"
FAIL=0
for url in ${URLS[@]+"${URLS[@]}"}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${url}?${CB}")
  if [ "$code" = "200" ]; then
    echo "OK 200: $url"
  else
    echo "NG $code: $url"
    FAIL=1
  fi
done
if [ "$FAIL" -eq 1 ]; then
  echo "エラー: 本番確認NGあり。デプロイ結果を確認してください。"
  exit 1
fi
echo "✅ 公開フロー完了"
