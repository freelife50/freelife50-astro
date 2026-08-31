# 定型フロー完全スクリプト化（2026-08-18・Pro移行準備②）

ブログ公開とX登録の機械作業を全部スクリプトに固めた。**モデルが書くのは「記事本文」と「X文面manifest」だけ。**ID採番・文字数計算・検証・ファイル更新・ビルド・デプロイ・確認はスクリプトが実行する。Sonnetでもミスなく回り、会話トークンも大幅に減る。

## スクリプト一覧（全てテスト済み）

| スクリプト | 場所 | 役割 |
|---|---|---|
| `optimize_images.py` | `~/Documents/freelife50-astro/scripts/` | 画像軽量化（EXIF向き補正→長辺1200px→150KB目標圧縮→300KB超は縮小フォールバック→それでもNGなら停止） |
| `validate_articles.py` | 同上 | front matter検証（カテゴリ1個・タグ3〜5・eyecatch/SNS画像の実在と300KB以下・日英alternateSlug相互・slug整合） |
| `publish.sh` | 同上 | 公開1コマンド：記事検証→画像ゲート→wrangler認証確認→ビルド→デプロイ→キャッシュバスター付き200確認 |
| `wrangler_relogin.sh` | 同上 | 認証切れ復旧：OAuth URLを取り出して表示→社長がAuthorize→自動でwhoami成功確認 |
| `register_article.py` | `~/x_auto_posting/scripts/` | X登録：manifest→ID採番→検証→inventory/post_bank/r-redirects/_redirects/today_pin更新（全ファイルバックアップ付き） |
| `register_and_verify.sh` | 同上 | X登録1コマンド：登録→astroフルビルド再デプロイ→/r/ID転送確認→dry-run×2 |

## 使い方（新記事公開の完全フロー）

```bash
# 1. 画像軽量化（写真を所定パスへ）
/usr/bin/python3 ~/Documents/freelife50-astro/scripts/optimize_images.py \
  写真1.jpg 写真2.HEIC --outdir ~/Documents/freelife50-astro/public/images/wp-content/uploads/2026/08
# 1枚だけ改名: --name slug-eyecatch ／ WebP: --format webp

# 2. 記事md作成（← ここだけモデルの仕事）

# 3. 公開（検証→ビルド→デプロイ→本番確認まで1コマンド）
~/Documents/freelife50-astro/scripts/publish.sh \
  https://freelife50.com/slug/ https://en.freelife50.com/slug-en/

# 4. X文面manifest作成（← ここだけモデルの仕事。形式はregister_article.py冒頭のdocstring参照）
#    variants内のURLは {URL} と書けば短縮URLに自動置換される

# 5. X登録（採番→検証→登録→再デプロイ→転送確認→dry-runまで1コマンド）
~/x_auto_posting/scripts/register_and_verify.sh manifest.json
# 当日ブラストしない場合: --no-pin ／ 画像未デプロイで先に検証: --dry-run --skip-image-check
```

## 設計上のポイント
- **文字数計算はpost_to_x.pyの`count_twitter_chars`をimport**して本番と完全一致（URL=11.5・CJK=1・ASCII=0.5）
- 短縮URLの2ファイル形式差を自動処理：`r-redirects.json`=末尾スラッシュ**付き**／`public/_redirects`=スラッシュ**なし**`302`
- 書き込み前に inventory/post_bank/r-redirects/_redirects を全て `.bak-日時` でバックアップ
- 採番結果は `~/x_auto_posting/data/last_registration.json` に保存（後続検証が読む）
- 本番確認は必ず `?cb=` 付き（Cloudflare 1年キャッシュ事故対策）、画像確認はcurl（Python UAは403）
- `/usr/bin/python3` はPython 3.9 → `X | None` 型注釈は使えない（1回踏んだ）

## テスト結果（2026-08-18）
- optimize_images.py：10MB・orientation=6の横倒し画像 → 135KB・正しい向き・EXIF除去を確認（jpg/webp両方）
- validate_articles.py：直近4記事（わんダフル・夕日の滝 日英）全てOK判定
- register_article.py --dry-run：正常系＝採番4176/4177・SNS画像200確認OK／異常系＝文字数オーバー・タグ不足・日本語タグなし・tinyurlを全件検知して登録中止
- publish.sh --no-deploy：記事検証＋画像ゲート通過を確認（実デプロイは次回公開時に実施）

## 未検証（次回の実公開時に確認すること）
- publish.sh の実デプロイパス（ビルド〜wrangler deploy〜200確認）
- register_and_verify.sh の通し実行（登録→デプロイ→/r/転送→dry-run）
- wrangler_relogin.sh（次に認証が切れた時）
