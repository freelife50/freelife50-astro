# lang:ja → lang:en 修正作業ログ

**実施日**: 2026-05-02  
**ブランチ**: feature/lang-fix-en77 → main マージ  
**コミット**: `a9bcfd7`（feature）→ `dee7f59`（merge）

---

## Phase 1: バックアップブランチ作成 ✅

```
backup/before-lang-fix を作成・push
起点コミット: 0a33422
```

## Phase 2: 対象ファイル一覧確認 ✅

- 再判定スクリプトで77件を確認（全件再計測）
- 詳細: `docs/domain-migration/2026-05-lang-fix-list.md`
- `__trashed-3`（1件）は公開ページなしのため EN_SLUGS 対象外
- `doggyman` は body_ascii=0.94（閾値0.95未満、境界ケース）だがタイトル純英語のため含める

## Phase 3: lang フィールド一括修正 ✅

### 修正スクリプト実行結果

- 第1ラウンド: 71件修正・6件 VERIFY FAIL（frontmatterが500文字超のため先頭チェックが誤動作）
- 第2ラウンド: 失敗6件を個別修正・全件完了

### 修正後の lang フィールド集計

| 値 | 修正前 | 修正後 |
|----|--------|--------|
| `lang: "en"` | 8件 | **85件** |
| `lang: "ja"` | 221件 | **144件** |
| 合計 | 229件 | 229件 |

### 追加変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `astro.config.mjs` | EN_SLUGS を 8件 → 84件（76件追加） |
| `src/pages/en/page/[page].astro` | 新規作成（85件対応 9ページ分） |

## Phase 4: ローカルビルド確認 ✅

| 確認項目 | 結果 |
|---------|------|
| `npm run build` | ✅ 1081ページ・エラーなし |
| `en/index.html` の記事数 | ✅ 10件 |
| `en/page/2` 〜 `en/page/9` 生成 | ✅ 8ページ |
| `en/page/9` の記事数（最終ページ） | ✅ 5件（85-8×10） |
| JP `index.html` の EN スラッグ混入 | ✅ ゼロ |
| Worker EN_SLUGS 件数 | ✅ 84件 |
| 英語記事の canonical | ✅ `https://en.freelife50.com/[slug]/` |
| 英語記事の hreflang | ✅ ja/en/x-default 全設定 |

## Phase 5: コミット・マージ・push・デプロイ ✅

```
git commit: a9bcfd7 (feature/lang-fix-en77)
git merge: dee7f59 (main)
git push origin main: OK
wrangler deploy: ✨ Deployment complete! (18d0c751.freelife50-astro.pages.dev)
```

## Phase 6: 本番動作確認 ✅

### サンプル10件リダイレクト確認（JP → EN）

| 結果 | slug |
|------|------|
| ✅ 301 | corewarm-and-the-quiet-heat-a-belly-wrap-journey-in-your-50s |
| ✅ 301 | mt-takaos-hidden-trail-a-quiet-escape-few-ever-find |
| ✅ 301 | a-50-year-old-mans-challenge-with-dental-implants-part-1 |
| ✅ 301 | the-50s-decision-im-not-worth-1-an-hour-why-i-chose-to-save-my-life-not-just-my-money |
| ✅ 301 | waking-up-at-4-a-m-changed-my-life |
| ✅ 301 | a-man-in-his-50s-finally-bought-an-iphone-17 |
| ✅ 301 | proved-in-the-rain-a-50s-hikers-challenge-in-tanzawa |
| ✅ 301 | mt-takao-walked-with-my-son |
| ✅ 301 | hiking-kobo-yama-bbq-a-perfect-spring-day-close-to-the-city |
| ✅ 301 | izumi-no-mori-yamato-a-free-dog-friendly-walk-where-old-japan-eased-my-mind |

### その他確認

| 確認項目 | 結果 |
|---------|------|
| `en.freelife50.com/` → 200 | ✅ |
| `en.freelife50.com/in-my-50s-...` → 200 | ✅ |
| `en.freelife50.com/en/page/2/` → 200 | ✅ |
| `en.freelife50.com/en/page/9/` → 200 | ✅ |
| `freelife50.com/` → 200（JP TOPは正常） | ✅ |

---

## 最終状態サマリー

```
【en.freelife50.com で公開される英語記事】
  - 合計: 85件
    ├── 既存8件（-en サフィックス付き）
    └── 新規77件（lang: ja → en 修正）

【freelife50.com に残る日本語記事】
  - 合計: 144件（__trashed含む）

【Worker EN_SLUGS】
  - 合計: 84件（8 + 76）
  - ※ __trashed-3 は公開ページなしのため除外

【ページネーション】
  - en/index.astro: 第1ページ（10件）
  - en/page/[2-9]/: 第2〜9ページ（各10件、最終5件）
```

---

## 注意事項

- Google が freelife50.com/[en-slug]/ をインデックス済みの場合、301 により自動的に en.freelife50.com に移行される
- Search Console でカバレッジの変化を確認することを推奨（2〜3日後）
- sitemap は freelife50.com 側のみ（/en/ 配下は除外済み）
  → en.freelife50.com 用 sitemap の別途作成は今後の課題
