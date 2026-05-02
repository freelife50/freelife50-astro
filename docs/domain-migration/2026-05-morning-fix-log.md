# 朝の一括修正ログ
**実施日**: 2026-05-03  
**ブランチ**: main  
**バックアップ**: backup/before-morning-fix（作成済み）

---

## Phase 1: バックアップ ✅

```
git branch backup/before-morning-fix
```
→ 作成完了

---

## Phase 2: 問題1 - 4記事の <h2>body</h2> 除去

**対象ファイル:**
- `2025-04-19-mountains-sea-my-dog-and-my-wife-plus-fried-fish-and-beer-en.md` 18行目
- `2025-04-20-a-quiet-goodbye-a-quiet-hello-en.md` 18行目
- `2025-04-30-this-post-shares-a-peaceful-spring-outing-to-kannonzaki-with-my-wife-en.md` 25行目
- `2025-05-04-this-post-shares-a-quiet-moment-of-reflection-sparked-by-a-wartime-en.md` 18行目

**原因**: 抽出スクリプトが `<h2>本文/body</h2>` という見出しをそのまま残した

---

## Phase 3: 問題2 - yahoo-japan-en.md 修正

**問題:**
- title: "Yahoo! JAPAN"（誤抽出）
- slug: "yahoo-japan-en"（誤り）
- 本文: 画像4枚のみ（英語テキスト0文字）
- 実際の内容: 「花ざかりの君たちへ」アニメ化記事（JA版: `2025-05-15-初心者だけど気になる-花ざかりの君たちへ.md`）

---

## Phase 4: 問題3 - タグ超過12件の修正

**対象（ヘルスチェックレポート記載、今夜追加57記事内のEN版）:**
1. `2025-05-13-rethinking-ai-romance-scams-...-en.md` 11個 → 5個へ
2. `2025-05-15-yahoo-japan-en.md` 10個 → 問題2と合わせて対応
3. `2025-06-01-i-cant-stop-thinking-about-chan-kei-ramen-en.md` 10個 → 5個へ
4. `2025-06-08-from-the-perspective-of-someone-in-their-50s-...-en.md` 9個 → 5個へ
5. `2025-05-19-in-may-2025-japans-minister-of-agriculture-...-en.md` 8個 → 5個へ
6. `2025-05-17-even-if-no-one-reads-it-...-en.md` 8個 → 5個へ
7. `2025-05-27-what-a-sudden-downpour-...-en.md` 8個 → 5個へ
8. `2025-05-31-which-bank-ecosystem-saves-you-more-...-en.md` 7個 → 5個へ
9. `2025-05-29-chigasaki-satoyama-park-...-en.md` 7個 → 5個へ
10. `2025-05-16-what-began-as-a-mix-up-...-en.md` 6個 → 5個へ
11. `2025-05-14-the-night-a-red-book-...-en.md` 6個 → 5個へ
12. `2025-06-02-as-a-man-in-his-50s-who-once-viewed-...-en.md` 6個 → 5個へ

---

## Phase 5: 問題4 - OGP width/height 追加

**対象**: `src/layouts/BaseLayout.astro`
**変更**: `og:image` の下に width="750" height="1000" を追加

---

## Phase 6: 問題5 - デフォルト画像記事リストアップ

（社長確認待ち）

---

## コミット履歴

| Phase | コミット | 内容 |
|-------|---------|------|
| 2 | TBD | fix: 4EN記事の不要な<h2>body</h2>見出しを削除 |
| 3 | TBD | fix: yahoo-japan-en タイトル・slug・本文修正 |
| 4 | TBD | fix: タグ超過12件を5個以下に整理 |
| 5 | TBD | feat: OGP og:image:width/height を BaseLayout に追加 |

---

## ビルド確認結果

| Phase | ビルド結果 |
|-------|-----------|
| 2 | TBD |
| 3 | TBD |
| 4 | TBD |
| 5 | TBD |
