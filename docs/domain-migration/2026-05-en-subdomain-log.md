# en.freelife50.com サブドメイン分離 実装ログ

**作業開始**: 2026-05-02  
**ブランチ**: feature/en-subdomain  
**実装方針**: Cloudflare Pages Advanced Mode (`dist/_worker.js`) + Astro 静的ページ分離

---

## 採用アーキテクチャ

```
【静的ビルド（Astro SSG）】
  dist/index.html         → 日本語記事一覧（TOPページ）
  dist/page/[n]/          → 日本語記事ページネーション
  dist/en/index.html      → 英語記事一覧（新規）
  dist/[all-slugs]/       → 日英全記事の詳細ページ（変更なし）
  dist/_worker.js         → Cloudflare Pages Worker（ビルドフックで自動生成）

【dist/_worker.js（Cloudflare Pages Advanced Mode）】
  en.freelife50.com/        → /en/ のコンテンツをリライト
  en.freelife50.com/page/N  → /en/page/N のコンテンツをリライト
  en.freelife50.com/[ja-slug] → freelife50.com/[ja-slug] に 301 リダイレクト
  freelife50.com/[en-slug]  → en.freelife50.com/[en-slug] に 301 リダイレクト
  その他                   → env.ASSETS.fetch（通常の静的配信）
```

**なぜこの方針か：**
- SSGのまま維持（出力: 'static'）→ パフォーマンス劣化なし
- `wrangler pages deploy dist` でデプロイ可能（CI/CD不要）
- Functions ディレクトリ配置の複雑さを回避
- Worker コードがリポジトリ内で管理可能

---

## 事前チェック結果

| 項目 | 結果 |
|------|------|
| git status | ✅ クリーン（未コミット変更は stash 退避済み） |
| origin/main 同期 | ✅ 同期済み |
| Cloudflare 認証 | ✅ umubura@gmail.com でログイン済み |
| npm run build | 作業後に確認予定 |

---

## 英語記事 slug リスト（8件）

```
komachi-shrine-takamatsu-hiking-en
ninomiya-sodegaura-hiking-en
yokohama-kodomo-shizen-park-firefly-en
momiji-rabies-vaccine-en
sagami-odako-festival-2026-en
hakone-museum-of-art-gardener-en
grands-grain-free-dog-food-review-shiba-inu-en
iijmio-1year-report-en
```

---

## Phase 別実施記録

### Phase 0: 事前チェック
- **開始**: 2026-05-02
- **結果**: ✅ 完了
- **実施内容**:
  - git stash で未コミット変更を退避
  - feature/en-subdomain ブランチ作成

### Phase 1: 設計確定・ログ作成
- **開始**: 2026-05-02
- **結果**: ✅ 完了

### Phase 2: Astro 改修
- **開始**: 2026-05-02 21:42
- **結果**: ✅ 完了
- **変更ファイル**:
  - [x] `astro.config.mjs` - Worker 生成フック追加・sitemap フィルタ追加
  - [x] `src/pages/index.astro` - `lang !== 'en'` でフィルタ（日本語記事のみ）
  - [x] `src/pages/page/[page].astro` - 同上
  - [x] `src/pages/en/index.astro` - 英語記事一覧（新規作成）
  - [x] `src/layouts/BaseLayout.astro` - lang 別 canonical・hreflang・canonicalOverride
  - [x] `src/layouts/PostLayout.astro` - slug プロパティ追加・hreflangEnUrl 生成
  - [x] `src/pages/[slug].astro` - slug を PostLayout に渡す

### Phase 3: ローカルビルド確認
- **結果**: ✅ 完了（1081ページ・エラーなし・`dist/_worker.js` 生成確認）

### Phase 4: コミット・マージ・push
- **結果**: ✅ 完了
  - feature/en-subdomain ブランチ → main にマージ（コミット: `17a3204`）
  - git push origin main 完了

### Phase 5: Cloudflare 設定
- **結果**: ✅ 完了
  - `wrangler pages deploy dist` でデプロイ（`✨ Compiled Worker successfully`）
  - Cloudflare Pages に `en.freelife50.com` カスタムドメイン追加（API）
  - Cloudflare DNS に `en CNAME → freelife50-astro.pages.dev`（ブラウザ操作）
  - SSL 証明書発行完了・ステータス `active`

### Phase 6: 本番動作確認
- **結果**: ✅ 主要機能確認完了・⚠️ 軽微な問題2件発見（レビューで修正）

| 確認項目 | 結果 |
|---|---|
| freelife50.com TOP 200 | ✅ |
| en.freelife50.com TOP 200 | ✅ |
| en.freelife50.com/[en-slug]/ 200 | ✅ 全6件確認 |
| freelife50.com/[en-slug]/ → en 301 | ✅ |
| en.freelife50.com/[ja-slug]/ → ja 301 | ✅ |
| hreflang ja/en/x-default | ✅ |
| en.freelife50.com/sitemap → 301 | ⚠️ Worker が .xml もリダイレクト対象にしてしまっている |
| サイドバー「最近の投稿」英語記事混入 | ⚠️ Sidebar.astro フィルタ未適用 |

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `astro.config.mjs` | Worker 生成フック・sitemap /en/ フィルタ追加 |
| `src/pages/index.astro` | 日本語記事のみ表示（lang !== 'en'） |
| `src/pages/page/[page].astro` | 同上 |
| `src/pages/en/index.astro` | 英語記事一覧（新規） |
| `src/layouts/BaseLayout.astro` | canonical lang 切替・hreflang・canonicalOverride |
| `src/layouts/PostLayout.astro` | slug プロパティ・hreflangEnUrl 生成 |
| `src/pages/[slug].astro` | slug を PostLayout に渡す |

---

## 動作確認結果

→ Phase 6 セクション参照

---

## 朝の確認チェックリスト

- [ ] https://freelife50.com が日本語トップページを表示するか
- [ ] https://en.freelife50.com が英語記事一覧を表示するか
- [ ] https://en.freelife50.com/momiji-rabies-vaccine-en/ が英語記事を表示するか
- [ ] https://freelife50.com/momiji-rabies-vaccine-en/ が en.freelife50.com にリダイレクトされるか
- [ ] https://freelife50.com/2026-03-10-ブログのネタ... が正常に表示されるか（日本語記事確認）
- [ ] hreflang が英語記事に設定されているか（ブラウザのソースで確認）
- [ ] canonical が英語記事では en.freelife50.com を指しているか

---

## ロールバック手順

### ブログ本体への影響が出た場合

```bash
# option 1: main ブランチに戻す（このブランチをマージしていない場合）
git checkout main

# option 2: main にマージ済みでロールバックが必要な場合
cd /Users/asa/Documents/freelife50-astro
git revert HEAD  # 最新コミットを revert
git push origin main
npm run build && npx wrangler pages deploy dist --project-name freelife50-astro
```

### Cloudflare Pages の1つ前のデプロイに戻す方法

1. https://dash.cloudflare.com → Pages → freelife50-astro
2. Deployments タブ → 1つ前のデプロイメントを選択
3. "Rollback to this deployment" をクリック

### stash から元の変更を復元する

```bash
git stash pop
```

---

## 判断に迷った点・メモ

- **Cloudflare Pages Functions vs `_worker.js`**: Functions ディレクトリは `wrangler pages deploy` での手動デプロイ時に含まれないため、`dist/_worker.js`（Advanced Mode）を採用。
- **SSR vs SSG**: SSRへの移行は影響が大きいため、SSGのまま維持。
- **カテゴリ・タグページの分離**: 今回はスコープ外。`en.freelife50.com/category/` は通常の静的配信のまま（Worker でフィルタせず）。
