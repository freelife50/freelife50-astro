# freelife50-astro

ラーメンとビールと時々ブログ — Astro 静的サイト（Cloudflare Pages ホスティング）

## 🚀 セットアップ

```sh
npm install
cp .env.example .env
# .env に測定IDを設定（下記参照）
```

## 🧞 コマンド

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm run dev`     | ローカル開発サーバー起動 `localhost:4321` |
| `npm run build`   | 本番ビルド → `./dist/`                  |
| `npm run preview` | ビルド結果のプレビュー                  |

## 📊 Google Analytics 4

### 環境変数

| 変数名                     | 説明              |
| :------------------------- | :---------------- |
| `PUBLIC_GA_MEASUREMENT_ID` | GA4 測定ID（`G-XXXXXXXXXX` 形式） |

### ローカル確認

`.env` に測定IDが設定されていれば、`npm run dev` 後にブラウザの開発者ツール（Network タブ）で `googletagmanager.com` へのリクエストが確認できる。

### Cloudflare Pages への環境変数設定手順

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. 「Workers & Pages」→ 対象プロジェクト（freelife50-astro）を選択
3. 「設定」→「環境変数」タブを開く
4. 「変数を追加」をクリック
5. 変数名：`PUBLIC_GA_MEASUREMENT_ID` ／ 値：`G-WZDZ7RXHL8` を入力
6. 「保存」→再デプロイすれば反映される

### 本番確認

デプロイ後、GA4 管理画面の「レポート」→「リアルタイム」でサイトを開くとアクセスが計測されていることを確認できる。

### 恒久ルール

- 新規ページは `BaseLayout.astro` を使えば GA4 が自動で適用される
- `src/components/GoogleAnalytics.astro` が測定コンポーネント本体
- `PUBLIC_GA_MEASUREMENT_ID` 未設定時は何も出力されない（開発環境で無効化したい場合は `.env` から削除）
- Cloudflare Pages 側にも同じ環境変数の設定が必要

## 🏗️ プロジェクト構造

```text
/
├── public/
├── src/
│   ├── components/
│   │   ├── GoogleAnalytics.astro   ← GA4 トラッキングコード
│   │   ├── Pagination.astro
│   │   ├── PostCard.astro
│   │   └── Sidebar.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro        ← 全ページ共通（GA4 読み込み済み）
│   │   └── PostLayout.astro
│   └── pages/
└── package.json
```
