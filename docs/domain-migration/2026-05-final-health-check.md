# freelife50.com 本番ヘルスチェックレポート

**実施日時**: 2026-05-03（夜間自動検証）  
**対象**: 今夜の作業（サブドメイン分離 + 英語版57記事抽出）  
**検証者**: Claude  
**判定基準**: ✅ OK / ⚠️ 要確認 / ❌ NG

---

## 総合サマリー

| Part | 結果 | 主な問題 |
|------|------|---------|
| Part 1: ローカルファイル分析 | ⚠️ 要対応 | EN記事4件が実質空・タグ数超過12件 |
| Part 2: ライブサイト HTTP | ✅ OK | 全65記事200・リダイレクト正常 |
| Part 3: ビルド出力・SEO | ⚠️ 要確認 | hreflang ja リンク・サイトマップ構成 |
| Part 4: git 状態 | ⚠️ 要確認 | 未コミット1件・未追跡5件 |
| Part 5: パフォーマンス | ✅ OK | en. 57-100ms・ja. 344ms（許容範囲） |

---

## Part 1: ローカルファイル分析

### 1.1 記事数サマリー

```
$ python3 -c "..."
Total .md files: 286
lang:ja  -> 144
lang:en  -> 142
lang:??? -> 0
-en.md files (2026): 8
-en.md files (2025-04~06): 57
-en.md files total: 65
```

| 項目 | 数値 | 期待値 | 判定 |
|------|------|--------|------|
| 総 .md ファイル数 | 286 | - | ✅ |
| lang:ja 記事 | 144 | - | ✅ |
| lang:en 記事 | 142 | - | ✅ |
| lang 未設定 | 0 | 0 | ✅ |
| 今夜追加 -en.md (2025-04~06) | 57 | 57 | ✅ |
| -en.md 合計 (既存8+新規57) | 65 | 65 | ✅ |

### 1.2 EN_SLUGS 整合性チェック

```
$ python3 -c "..."
EN_SLUGS total: 141
With -en suffix: 65
Without -en suffix: 76
Duplicates: 0
Missing files for slugs: 0
```

| 項目 | 数値 | 判定 |
|------|------|------|
| EN_SLUGS 総件数 | 141 | ✅ |
| -en サフィックス付き | 65 | ✅ |
| -en なし（既存英語記事） | 76 | ✅ |
| 重複スラッグ | 0 | ✅ |
| スラッグに対応ファイル不在 | 0 | ✅ |

### 1.3 今夜追加57記事のフロントマターチェック

**チェック結果: 57件中 37件OK / 20件に問題**

#### ❌ CRITICAL: EN本文が実質空（抽出失敗）4件

これらは EN ファイルの body が `"body"` または `"BODY"` という4文字のみ。  
対応する JA ファイルには英語テキストが残存している（alpha ASCII比率 0.58〜0.62）。

| EN ファイル | EN本文長 | 症状 |
|-------------|---------|------|
| `2025-04-19-mountains-sea-my-dog-and-my-wife-plus-fried-fish-and-beer-en.md` | 4 chars | `<h2>body</h2>` のみ |
| `2025-04-20-a-quiet-goodbye-a-quiet-hello-en.md` | 4 chars | `<h2>body</h2>` のみ |
| `2025-04-30-this-post-shares-a-peaceful-spring-outing-to-kannonzaki-with-my-wife-en.md` | 4 chars | `<h2>BODY</h2>` のみ |
| `2025-05-04-this-post-shares-a-quiet-moment-of-reflection-sparked-by-a-wartime-en.md` | 4 chars | `<h2>BODY</h2>` のみ |

**原因仮説**: これらの記事は `<h2>本文/body</h2>` という見出しで始まり、  
その後の本文が `<p>JA。EN。</p>` のように `<br>` なしで文章レベルで混在するパターン。  
`heading_split()` が `body` を EN 部分として抽出し、その後の `<p>` 段落の EN 分離に失敗した可能性。

**影響**: 4つの EN 記事がほぼ空（画像のみ）の状態でライブ公開されている。  
対応 JA 記事には英語テキストが削除されずに残っている。

#### ⚠️ 本文が短い記事（300文字未満）4件

| ファイル | 本文長 | コメント |
|---------|--------|---------|
| `2025-04-27-beer-today-marathon-tomorrow-en.md` | 115 chars | 英語2-3文のみ |
| `2025-05-02-if-ai-feels-a-little-intimidating-maybe-this-post-will-soften-that-en.md` | 118 chars | 英語2文のみ |
| `2025-05-02-when-an-unexpected-hole-turned-into-a-source-of-healing-en.md` | 129 chars | 英語2文のみ |
| `2025-05-06-this-post-shares-personal-reflections-from-someone-in-japans-dankai-en.md` | 179 chars | 英語3文のみ |

**原因仮説**: 元のバイリンガル記事に含まれる英語量が少なかった（短いイントロのみ）。  
コンテンツとしては不完全だが、抽出スクリプトとしては正常動作の可能性あり。

#### ⚠️ タグ数超過（6〜11個、規定は3〜5個）12件

| ファイル | タグ数 |
|---------|--------|
| `2025-05-13-rethinking-ai-romance-scams-...-en.md` | **11** |
| `2025-05-15-yahoo-japan-en.md` | **10** |
| `2025-06-01-i-cant-stop-thinking-about-chan-kei-ramen-en.md` | **10** |
| `2025-06-08-from-the-perspective-of-someone-in-their-50s-...-en.md` | 9 |
| `2025-05-19-in-may-2025-japans-minister-of-agriculture-...-en.md` | 8 |
| `2025-05-17-even-if-no-one-reads-it-...-en.md` | 8 |
| `2025-05-27-what-a-sudden-downpour-...-en.md` | 8 |
| `2025-05-31-which-bank-ecosystem-saves-you-more-...-en.md` | 7 |
| `2025-05-29-chigasaki-satoyama-park-...-en.md` | 7 |
| `2025-05-16-what-began-as-a-mix-up-...-en.md` | 6 |
| `2025-05-14-the-night-a-red-book-...-en.md` | 6 |
| `2025-06-02-as-a-man-in-his-50s-who-once-viewed-...-en.md` | 6 |

**原因**: EN ファイル生成時に元 JA 記事のタグをそのままコピーしており、  
JA 記事側でタグが多かった場合はそのまま引き継がれる。  
**規定違反（タグ3〜5個）だが、サイト表示・動作には影響なし。**

#### ⚠️ excerpt が空（NO_EXCERPT）4件

| ファイル | 備考 |
|---------|------|
| `2025-04-19-mountains-sea-...` | 抽出失敗記事と一致 |
| `2025-04-20-a-quiet-goodbye-...` | 抽出失敗記事と一致 |
| `2025-04-30-this-post-shares-a-peaceful-spring-outing-...` | 抽出失敗記事と一致 |
| `2025-05-04-this-post-shares-a-quiet-moment-...` | 抽出失敗記事と一致 |

上記4件は EN 本文空の記事と完全一致。本文がないため excerpt も生成されなかった。

#### ✅ 問題なし項目

| 項目 | 結果 |
|------|------|
| lang: "en" 設定 | 57件全て ✅ |
| title に CJK（日本語）混入 | 0件 ✅ |
| date フォーマット正常 | 57件全て ✅ |
| categories 1個設定 | 57件全て ✅ |
| eyecatch 設定済み | 57件全て ✅ |
| ASCII 比率 0.70 未満（日本語混入） | 0件 ✅ |

#### ⚠️ 特記事項：yahoo-japan-en.md のタイトル問題

- ファイル: `2025-05-15-yahoo-japan-en.md`
- タイトル: `"Yahoo! JAPAN"` ← **明らかに誤抽出**
- 実際の内容: 「花ざかりの君たちへ」アニメ化についての記事
- 原因仮説: 元記事の本文内に Yahoo Japan へのリンクがあり、そのリンクテキストが
  見出しとして誤抽出された
- slug が `yahoo-japan-en` になっており、記事内容と全く一致しない

### 1.4 元のJA記事（58件）への影響確認

**対象期間のJA記事（2025-04-16〜2025-06-08、lang:ja）: 58件**

```
OK: 49件
Issues: 9件（4件は抽出失敗、5件は HIGH_ASCII）
```

| ファイル | 問題 | 備考 |
|---------|------|------|
| `2025-04-19-山と海と-...` | HIGH_ASCII=0.63 | 抽出失敗のため英語残存 |
| `2025-04-25-氏神様に見守られて歩く朝.md` | HIGH_ASCII=0.64 | 英語インライン残存の可能性 |
| `2025-04-27-日本-アメリカ-腰痛50代-...` | HIGH_ASCII=0.63 | 英語インライン残存の可能性 |
| `2025-04-27-腰痛50代-明日マラソン-...` | HIGH_ASCII=0.65 | 英語インライン残存（確認済）|
| `2025-04-30-観音崎の海と-...` | HIGH_ASCII=0.63 | 抽出失敗のため英語残存 |
| `2025-05-02-チャッピーって誰やねん-...` | HIGH_ASCII=0.60 | 英語混在（軽微） |
| `2025-05-04-笑顔の写真-...` | HIGH_ASCII=0.63 | 抽出失敗のため英語残存 |
| `2025-05-06-団塊ジュニア世代へ-...` | HIGH_ASCII=0.63 | 英語インライン残存の可能性 |
| `2025-04-16-はじめまして-...` | BODY_SHORT=267 | 元記事が短い（問題なし） |

**注意**: HIGH_ASCII の閾値は 0.60 に設定しているが、  
数字・URL・英単語（人名・地名）が多い記事では JA 記事でも 0.55〜0.65 になることがある。  
実際に英語段落が残っているか目視確認が必要。

---

## Part 2: ライブサイト HTTP 確認

### 2.1 基本アクセス

```
$ curl -o /dev/null -s -w "%{http_code} ..." https://freelife50.com/
200

$ curl -o /dev/null -s -w "%{http_code} ..." https://en.freelife50.com/
200
```

| URL | ステータス | 判定 |
|-----|----------|------|
| https://freelife50.com/ | 200 | ✅ |
| https://en.freelife50.com/ | 200 | ✅ |

### 2.2 全65 EN記事のアクセス確認

```
（並列 curl -P 8 で全65件テスト実施）
結果: 65件全て 200
```

| 項目 | 数値 | 判定 |
|------|------|------|
| 200 OK | 65 / 65 | ✅ |
| 404 / その他エラー | 0 / 65 | ✅ |
| 平均レスポンスタイム | 約 75ms | ✅ |
| 最速 | 57ms (tanzawa-trail-en) | ✅ |
| 最遅 | 98ms (yokohama-kodomo-shizen-park-firefly-en) | ✅ |

### 2.3 リダイレクト確認

```
$ curl -I https://freelife50.com/hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en/
HTTP/2 301
location: https://en.freelife50.com/hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en/

$ curl -I https://en.freelife50.com/腰痛50代-明日マラソンなのに... (JA slug)
HTTP/2 301
location: https://freelife50.com/...
```

| 確認項目 | 結果 | 判定 |
|---------|------|------|
| freelife50.com/[en-slug]/ → en.freelife50.com/[en-slug]/ | 301 ✅ | ✅ |
| Location ヘッダーが正しいか | en.freelife50.com/... ✅ | ✅ |
| en.freelife50.com/[ja-slug]/ → freelife50.com/[ja-slug]/ | 301 ✅ | ✅ |
| リダイレクトループ | なし ✅ | ✅ |

---

## Part 3: ビルド出力・SEO 確認

### 3.1 ビルドページ数内訳

```
$ find dist -name "index.html" | wc -l
1143 (+ _worker.js 等のルートファイルで 1144)
```

| 種別 | 数 |
|------|---|
| JA記事（日本語スラッグ） | 132 |
| EN記事（-en スラッグ） | 65 |
| EN記事（英語スラッグ・-en なし） | 86 |
| カテゴリページ | 7 |
| JA ページネーション | 14 |
| EN ページネーション | 14 |
| トップ・/en/index | 2 |

### 3.2 canonical・OGP 確認（サンプル）

```html
<!-- hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en -->
<link rel="canonical" href="https://en.freelife50.com/hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en/">
<meta property="og:url" content="https://en.freelife50.com/...">
<meta property="og:title" content="Hi there! I've started a blog about ramen, beer, and a bit of blogging.">
<meta property="og:image" content="https://en.freelife50.com/images/...">
<meta name="twitter:card" content="summary_large_image">
```

| 項目 | 結果 | 判定 |
|------|------|------|
| canonical → en.freelife50.com | ✅ 確認 | ✅ |
| og:url → en.freelife50.com | ✅ 確認 | ✅ |
| og:title → EN タイトル | ✅ 確認 | ✅ |
| og:image → 画像パス設定済み | ✅ 確認 | ✅ |
| twitter:card → summary_large_image | ✅ 確認 | ✅ |

### 3.3 hreflang 確認

```html
<link rel="alternate" hreflang="ja"
  href="https://freelife50.com/hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en/">
<link rel="alternate" hreflang="en"
  href="https://en.freelife50.com/hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en/">
<link rel="alternate" hreflang="x-default"
  href="https://freelife50.com/hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en/">
```

| 項目 | 結果 | 判定 |
|------|------|------|
| hreflang="en" → en.freelife50.com/[en-slug]/ | ✅ 正しい | ✅ |
| hreflang="ja" → freelife50.com/[en-slug]/ | ⚠️ EN スラッグで 301 リダイレクト先 | ⚠️ |
| hreflang="x-default" → freelife50.com/[en-slug]/ | ⚠️ 同上 | ⚠️ |

**⚠️ 要確認: hreflang="ja" の問題**

`hreflang="ja"` は本来、対応する**日本語版記事**の URL を指定すべきだが、  
現在は EN スラッグをそのまま freelife50.com に付けた URL になっている。  
この URL にアクセスすると 301 で en.freelife50.com にリダイレクトされるため、  
実質「JA 版 = EN 版と同じ」という設定になっている。

**理想**: `hreflang="ja"` は対応 JA 記事の URL を指す（例: `/はじめまして-ラーメンと-...`）  
**現状**: `hreflang="ja"` = `freelife50.com/hi-there-ive-started-...-en/` (→ 301 → EN 記事)  
**影響度**: SEO 上の悪影響はあるが、即時クロールエラーにはならない。

### 3.4 サイトマップ確認

```
$ python3 -c "..."
sitemap total URLs: 1129
-en URLs: 65 (全て freelife50.com ドメイン)
en.freelife50.com URLs: 0
Unique domains: {'freelife50.com'}
```

| 項目 | 現状 | 理想 | 判定 |
|------|------|------|------|
| サイトマップ総 URL 数 | 1129 | - | ✅ |
| EN 記事の URL ドメイン | freelife50.com | en.freelife50.com | ⚠️ |
| en.freelife50.com 独自サイトマップ | なし | あれば尚良 | ⚠️ |
| /en/ パスがフィルタリングされているか | ✅ 除外済 | 除外 | ✅ |
| sitemap-index.xml | 1 sitemap | - | ✅ |

**⚠️ EN 記事のサイトマップ URL がリダイレクトされる**  
サイトマップ内の EN 記事 URL（例: `https://freelife50.com/chigasaki-satoyama-park-...-en/`）は  
実際には 301 で `en.freelife50.com` にリダイレクトされる。  
Google は正規 URL として en.freelife50.com を把握するが、  
サイトマップに canonical URL を直接記載する方が SEO 的には望ましい。  
**ただし Google は 301 先を canonical として認識するため、致命的ではない。**

### 3.5 robots.txt 確認

```
$ curl -s https://freelife50.com/robots.txt | grep -i sitemap
（出力なし）

$ curl -s https://en.freelife50.com/robots.txt | grep -i sitemap
（出力なし）
```

| 項目 | 結果 | 判定 |
|------|------|------|
| 両ドメインに robots.txt あり | ✅ (Cloudflare 管理) | ✅ |
| User-agent: * Allow: / | ✅ | ✅ |
| Sitemap: 参照行 | ❌ 記載なし | ⚠️ |
| ClaudeBot / GPTBot Disallow | ✅ Cloudflare 自動設定 | ✅ |

**⚠️ robots.txt に Sitemap: 行がない**  
`Sitemap: https://freelife50.com/sitemap-index.xml` の記載がない。  
現状は Google Search Console 経由でサイトマップを送信していれば問題ないが、  
robots.txt から直接参照できると新規クローラーへの発見性が上がる。

### 3.6 HTML サイズ（EN 記事）

```
最小: 6,231 bytes (mountains-sea-my-dog-and-my-wife-...-en) ← 抽出失敗記事
最大: 22,201 bytes (sagami-odako-festival-2026-en)
```

| 項目 | 結果 | 判定 |
|------|------|------|
| 最小 HTML (6KB) | 抽出失敗記事と一致 | ⚠️ |
| 正常記事の平均 HTML | 9〜18 KB | ✅ |
| 異常に大きいページ | なし | ✅ |

---

## Part 4: git 状態確認

```
$ git status --short
 M src/content/blog/2025-08-04-家族だから-食べるものにもやさしさを.md
?? docs/domain-migration/2026-05-emergency-audit.md
?? docs/domain-migration/2026-05-missing-en-list.md
?? docs/domain-migration/2026-05-pair-final.md
?? docs/domain-migration/2026-05-wordpress-en-audit.md
?? scripts/extract-en-bilingual.py

$ git log --oneline -5
25c2bf9 Phase 3: Extract EN content from 57 bilingual JA articles
0169e8b docs: lang修正作業ログ・対象リスト作成
dee7f59 merge: feature/lang-fix-en77 → main
a9bcfd7 feat: 英語記事77件の lang: ja → en 一括修正
0a33422 docs: コンテンツ監査レポート作成
```

| 項目 | 状態 | 判定 |
|------|------|------|
| main ブランチ | ✅ | ✅ |
| origin/main と同期済み | ✅ (push 確認済) | ✅ |
| 未コミット変更ファイル | 1件 | ⚠️ |
| 未追跡ファイル | 5件 | ⚠️ |
| バックアップブランチ残存 | 4件（before-extract-en 等）| ✅ 意図的 |

**未コミット変更（1件）:**  
`2025-08-04-家族だから-食べるものにもやさしさを.md` — eyecatch フィールド追加（今夜の作業とは無関係の変更）

**未追跡ファイル（5件）:**
- `docs/domain-migration/2026-05-emergency-audit.md` — 調査ドキュメント
- `docs/domain-migration/2026-05-missing-en-list.md` — 調査ドキュメント
- `docs/domain-migration/2026-05-pair-final.md` — 調査ドキュメント
- `docs/domain-migration/2026-05-wordpress-en-audit.md` — 監査レポート
- `scripts/extract-en-bilingual.py` — 抽出スクリプト本体

→ **抽出スクリプトと調査ドキュメントが git 未追跡のまま。将来の再現性のために commit 推奨。**

---

## Part 5: パフォーマンス確認

```
$ curl -o /dev/null -s -w "%{http_code} %{time_total}s\n" ...

freelife50.com top:       200 0.072s
en.freelife50.com top:    200 0.078s
tanzawa-trail-en:         200 0.057s
chigasaki-en:             200 0.078s
kanagawa-japan (EN):      200 0.087s
freelife50.com category:  200 0.344s
freelife50.com JA article: 200 0.364s
```

| URL 種別 | レスポンスタイム | 判定 |
|---------|---------------|------|
| en.freelife50.com 記事 | 57〜100ms | ✅ |
| freelife50.com トップ | 72ms | ✅ |
| freelife50.com カテゴリ | 344ms | ⚠️ 要観察 |
| freelife50.com JA 記事 | 364ms | ⚠️ 要観察 |

**⚠️ JA 記事・カテゴリが 300ms 台**  
EN 記事（CF CDN キャッシュ済み）と比較して JA 側が遅い。  
Cloudflare キャッシュの暖まり具合の差の可能性あり。  
長期的に問題が続くようであれば調査が必要。

---

## 問題一覧（優先度付き）

### 🔴 優先度 HIGH（コンテンツ品質に影響）

| # | 問題 | 対象 | 推奨対応 |
|---|------|------|---------|
| 1 | EN 本文が実質空（"body"/"BODY" のみ、4文字） | 4記事 | EN 記事を手動で書き直し or 再抽出 |
| 2 | 対応 JA 記事に英語テキストが残存 | 4記事 | EN 抽出後に JA から手動削除 |
| 3 | `yahoo-japan-en.md` のタイトルが "Yahoo! JAPAN"（誤抽出） | 1記事 | タイトル・slug を正しい内容に修正 |

### 🟡 優先度 MEDIUM（SEO・ルール準拠）

| # | 問題 | 対象 | 推奨対応 |
|---|------|------|---------|
| 4 | タグ数超過（6〜11個、規定は3〜5個） | 12記事 | 5個以下に整理 |
| 5 | 本文が 115〜179 文字と短い EN 記事 | 4記事 | 手動で英文追記または許容判断 |
| 6 | hreflang="ja" が対応 JA 記事 URL でなく EN slug を指している | 全65記事 | Astro テンプレート修正で対応可能 |
| 7 | サイトマップ内の EN 記事 URL が canonical でなく redirect URL | 65記事 | site 設定変更 or sitemap フィルター修正 |
| 8 | robots.txt に `Sitemap:` 行なし | 両ドメイン | public/robots.txt を追加 |

### 🟢 優先度 LOW（将来対応）

| # | 問題 | 対象 | 推奨対応 |
|---|------|------|---------|
| 9 | 未コミット変更・未追跡ファイル5件（スクリプト等） | git | commit して整理 |
| 10 | JA 記事のレスポンスタイムが 300ms 台 | JA 全記事 | キャッシュ様子見、必要ならCDN設定見直し |

---

*このレポートは 2026-05-03 夜間に自動生成されました。*
