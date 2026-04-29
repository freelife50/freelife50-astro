# freelife50-astro プロジェクトルール

## Google Analytics 4（恒久ルール）

- 測定ID：`G-WZDZ7RXHL8`（環境変数 `PUBLIC_GA_MEASUREMENT_ID` で管理）
- トラッキングコンポーネント：`src/components/GoogleAnalytics.astro`
- `BaseLayout.astro` の `<head>` に組み込み済み → 新規ページは共通レイアウトを使えば自動適用
- Cloudflare Pages 側でも同じ環境変数の設定が必要（README 参照）
- `.env` は `.gitignore` に含まれているためコミット不要
