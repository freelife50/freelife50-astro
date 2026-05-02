# en.freelife50.com セルフレビューログ

**実施日時**: 2026-05-02 22:00〜22:15（JST）  
**ブランチ**: main  
**コミット**: `7ac06b4`（修正3件）

---

## 発見・修正した不具合

### Bug 1: Worker が .xml ファイルを日本語スラッグと誤判定して 301 リダイレクト

**発生箇所**: `astro.config.mjs` > `generateWorkerCode()` > `isArticleSlug` 判定  
**症状**: `en.freelife50.com/sitemap-index.xml` → `freelife50.com/sitemap-index.xml` に 301 リダイレクトされる  
**原因**: `isArticleSlug` に拡張子チェックがなく `.xml` や `.txt` も記事スラッグと判定していた  
**修正**:
```js
// Before
const isArticleSlug = slug && !slug.includes('/') && ...

// After
const isArticleSlug = slug &&
  !slug.includes('/') &&
  !/\.\w+$/.test(slug) &&  // .xml/.txt/.css 等の静的ファイルを除外
  ...
```

### Bug 2: Sidebar「最近の投稿」に英語記事が混入

**発生箇所**: `src/components/Sidebar.astro`  
**症状**: サイドバーの最近の投稿に英語記事（-en スラッグ）が表示される  
**原因**: `recent` 変数に `lang !== 'en'` フィルタが未適用だった  
**修正**:
```js
// Before
const recent = published.slice(0, 5);

// After
const recent = published.filter(p => p.data.lang !== 'en').slice(0, 5);
```

### Bug 3: iijmio 英語記事のフロントマターに `lang: "ja"` が設定されていた

**発生箇所**: `src/content/blog/2026-04-29-iijmio-1year-report-en.md`  
**症状**: iijmio 英語記事が日本語サイト（freelife50.com）の記事一覧・サイドバーに混入。en/ ページには表示されない  
**原因**: フロントマター作成時の設定ミス。`lang: "ja"` のまま公開されていた  
**修正**: `lang: "ja"` → `lang: "en"` に変更

---

## 本番動作確認結果（修正後）

| 確認項目 | 結果 |
|---|---|
| `en.freelife50.com/` → 200 | ✅ |
| `freelife50.com/` → 200（日本語TOPページ） | ✅ |
| `en.freelife50.com/` の canonical = `https://en.freelife50.com/` | ✅ |
| `en.freelife50.com/` に英語記事8件表示 | ✅ |
| `freelife50.com/` に EN スラッグが混入しない | ✅ |
| `en.freelife50.com/iijmio-1year-report-en/` → 200 | ✅ |
| `freelife50.com/iijmio-1year-report-en/` → 301 → en サブドメイン | ✅ |
| `en.freelife50.com/sitemap-index.xml` → 200（リダイレクトなし） | ✅ |
| iijmio 記事 canonical = `https://en.freelife50.com/iijmio-1year-report-en/` | ✅ |
| iijmio 記事 hreflang ja/en/x-default 全設定 | ✅ |
| Sidebar 最近の投稿に英語記事なし | ✅ |
| sitemap-0.xml に /en/ ページなし | ✅ |

---

## 今後の既知課題（スコープ外・次回対応）

- `en.freelife50.com` サイドバーが日本語のまま（「最近の投稿」が日本語記事）
  - 英語サイト用サイドバーの実装が必要
- `en.freelife50.com/category/` は通常の静的配信のまま（Worker でフィルタせず）
- en/ ページネーション（/en/page/N/）は手動実装が必要（現在 totalPages ≤ 1 なので未使用）

---

## 修正コミット

```
7ac06b4  fix: セルフレビュー3件修正（Worker .xml redirect / Sidebar ENフィルタ / iijmio lang: ja→en）
```

デプロイ: `wrangler pages deploy dist` → `ac9fe33c.freelife50-astro.pages.dev`

---

## 朝の最終確認チェックリスト（社長向け）

- [ ] https://freelife50.com が日本語トップページを表示するか
- [ ] https://en.freelife50.com が英語記事一覧8件を表示するか
- [ ] https://en.freelife50.com/iijmio-1year-report-en/ が英語記事を表示するか
- [ ] https://freelife50.com/iijmio-1year-report-en/ が en.freelife50.com にリダイレクトされるか
- [ ] https://en.freelife50.com/sitemap-index.xml が 200 で XML を返すか（301 にならない）
- [ ] サイドバー「最近の投稿」に `-en` スラッグが表示されないか
- [ ] hreflang が英語記事のソースに設定されているか
