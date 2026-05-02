# OGP画像設定 調査レポート
**調査日**: 2026-05-03  
**対象**: freelife50.com / en.freelife50.com  
**調査者**: Claude Code

---

## ■ 結論（要約）

**OGPの動的設定は既に正しく実装・動作している。**  
調査した正しいスラッグのURL全てで、記事固有のeyecatch画像がog:imageに設定されていることを確認。  
ただし `og:image:width` / `og:image:height` の指定がなく、改善余地あり。

---

## 1. サンプル記事10件のOGPメタタグ確認

### JPサイト（freelife50.com）

| スラッグ | og:image | twitter:card | 判定 |
|---------|---------|-------------|------|
| health-check-running | `uploads/2025/04/PXL_20250414_010642665-scaled.jpg` | summary_large_image | ✅ 記事固有 |
| iijmio-1year-report-ja | `uploads/2026/04/iijmio-1year-eyecatch.jpg` | summary_large_image | ✅ 記事固有 |
| grands-grain-free-dog-food-shiba-inu | `uploads/2026/04/grands_01_eyecatch.jpg` | summary_large_image | ✅ 記事固有 |
| 奥多摩ハイキング…（日本語スラッグ） | `uploads/2025/04/IMG_20250420_093638_6452.png` | summary_large_image | ✅ 記事固有 |
| hairstar記事（日本語スラッグ） | `uploads/2026/04/hairstar_eyecatch.jpg`（ローカル確認） | - | ✅ 記事固有（ローカル） |

### ENサイト（en.freelife50.com）

| スラッグ | og:image | twitter:card | 判定 |
|---------|---------|-------------|------|
| grands-grain-free-dog-food-review-shiba-inu-en | `uploads/2026/04/grands_01_eyecatch.jpg` | summary_large_image | ✅ 記事固有 |

> **注意**: 当初のサンプルURL（`/iijmio-1year-review/`等）は実際のスラッグと異なり、  
> JPサイトはトップページにフォールバック → デフォルト画像が表示された。  
> これはOGP設定の問題ではなく、存在しないURLへのサーバーフォールバック動作。

---

## 2. og:imageのユニーク数・集計

### ローカルコンテンツ（src/content/blog/、全286ファイル）

| 項目 | 値 |
|-----|---|
| 総記事数 | 286（JP版 + EN版含む） |
| eyecatch設定あり | 286 / 286（100%） |
| eyecatch未設定 | 0 |
| ユニークeyecatch URL数 | 151 |

### eyecatch TOP5（複数記事で共有されているもの）

| 使用数 | 画像パス | 理由 |
|-------|---------|------|
| 4件 | `2025/05/e107fc29eb554a9a3ef7f82b8148868f.png` | JP版・EN版共有 × 2記事ペア |
| 3件 | `2025/04/image-1-e1744931885735.png` | 複数記事で共有 |
| **3件** | **`2025/04/8d3acb8ac16d829c946f739ad4181f54.png`** | **デフォルト画像と同じ！（下記参照）** |
| 3件 | `2025/04/3e0fc0805b93a0cf6e6c93a1d839ef3d.png` | 複数記事で共有 |
| 2件 | 以降は各ペア（JP版・EN版） | 正常（同じ画像を両言語で使用） |

---

## 3. デフォルト画像と同じeyecatchを持つ記事

**デフォルトOG画像**: `/images/wp-content/uploads/2025/04/8d3acb8ac16d829c946f739ad4181f54.png`

この画像をeyecatchに設定している記事（3件）：

| ファイル | タイトル |
|---------|---------|
| `2025-04-16-はじめまして-ラーメンとビールと-時々ブログ.md` | はじめまして！ラーメンとビールと、時々ブログ始めました |
| `2025-04-16-hi-there-ive-started-a-blog-about-ramen-beer...en.md` | 英語版（同上） |
| `2026-02-13-from-tateishi-to-mt-okusu...en.md` | 英語ハイキング記事 |

→ これらはeyecatchとしてデフォルト画像を**意図的に**使っているか、または初期記事でeyecatchが未整備のもの。  
　 OGPとしてはデフォルト画像が表示されることになる（技術的には問題なし）。

---

## 4. テンプレートのog:image設定箇所

### BaseLayout.astro（L41-42）
```astro
const SITE_DEFAULT_OG_IMAGE = '/images/wp-content/uploads/2025/04/8d3acb8ac16d829c946f739ad4181f54.png';
const resolvedOgImage = new URL(ogImage ?? SITE_DEFAULT_OG_IMAGE, canonicalBase).toString();
```

- **参照変数**: `ogImage` prop（BaseLayoutへの入力）
- **フォールバック**: `SITE_DEFAULT_OG_IMAGE`（ハードコード）
- **絶対URL変換**: `new URL(...)` で `https://freelife50.com/...` に正規化

### PostLayout.astro（L38）
```astro
<BaseLayout title={title} description={excerpt} ogImage={eyecatch} ...>
```

- **参照変数**: フロントマターの `eyecatch` フィールド（文字列）
- `eyecatch` が渡されれば記事固有の画像、未設定なら BaseLayout 側でデフォルト画像を使用

### og:imageメタタグ出力（BaseLayout.astro L66-68）
```html
<meta property="og:image" content={resolvedOgImage} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content={resolvedOgImage} />
```

---

## 5. 現状の問題点と修正方針

### 問題1（軽微）: og:image:width / og:image:height が未設定
- **影響**: TwitterカードやFacebook OGP debuggerで警告が出る場合あり
- **修正方針**: eyecatch画像のサイズが記事ごとに異なるため固定値設定は難しい。  
  アイキャッチが縦長（750×1000）に統一されていれば width="750" height="1000" を追加できる

### 問題2（運用）: デフォルト画像がeyecatchとして設定されている初期記事が3件
- **影響**: Xでシェアすると全部同じ画像（ロゴ画像）に見える
- **修正方針**: 当該3記事に固有のeyecatch画像を設定する

### 問題3（サーバー）: 存在しないURLへのJPサイトのフォールバック動作
- **影響**: 間違ったURLでXシェアするとトップページ（デフォルト画像）が表示される
- **修正方針**: Cloudflare Pages の 404.html を適切に設定する（または現状維持）

### 問題4（なし）: 「全記事がデフォルト画像になっている」という認識は誤り
- 正しいスラッグのURLでは全て記事固有のeyecatch画像が正しく表示されている
- 問題は調査時に間違ったURLを使用したことで発生した誤認識

---

## 6. 調査メモ

- ENサイトトップ（en.freelife50.com/）はデフォルト画像 → 正常動作
- JPサイトのizumi英語版記事はJPサイトには存在しない → フォールバックでトップページ表示
- `og:image:width` / `og:image:height` は全記事で未出力
- `twitter:card` は全記事で `summary_large_image` → 正しい設定
