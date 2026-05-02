# コンテンツ監査レポート — 日英ペア構造調査

**調査日**: 2026-05-02  
**調査範囲**: `src/content/blog/` (229ファイル)  
**目的**: lang設定・ファイル命名規則・日英ペア構造の把握  
**作業制約**: 調査のみ・ファイル変更なし

> ⚠️ **注意**: `src/content/posts/` は存在しない。全記事は `src/content/blog/` 配下。

---

## 1. サマリー

| 項目 | 値 |
|------|-----|
| 総記事数 | 229 |
| `lang: "en"` | 8 件 |
| `lang: "ja"` | 221 件 |
| `lang` 未設定 | **0件**（全件設定済み）|
| `-en.md` サフィックス | 8 件 |
| `-ja.md` サフィックス | 1 件 |
| 完全な -en/-ja スラッグペア | 1 組（iijmio のみ） |
| 同日付 JA+EN ペア | **80 組** |
| 英語記事なのに `lang: "ja"` の記事 | **85 件**（うち77件が EN_SLUGS 未登録） |

---

## 2. ファイル命名規則の分析

### パターン分布

| パターン | 件数 | 説明 |
|---------|------|------|
| `-en.md` サフィックス | 8 | 英語版記事（全件 `lang: "en"`） |
| `-ja.md` サフィックス | 1 | `iijmio-1year-report-ja.md` のみ |
| `en-` / `ja-` プレフィックス | 0 | 使用なし |
| 言語マーカーなし | 220 | その他全件 |

### `-en.md` 8件（現在 EN_SLUGS に登録済み）

```
2026-04-16-komachi-shrine-takamatsu-hiking-en.md
2026-04-16-ninomiya-sodegaura-hiking-en.md
2026-04-18-yokohama-kodomo-shizen-park-firefly-en.md
2026-04-19-momiji-rabies-vaccine-en.md
2026-04-20-sagami-odako-festival-2026-en.md
2026-04-21-hakone-museum-of-art-gardener-en.md
2026-04-28-grands-grain-free-dog-food-review-shiba-inu-en.md
2026-04-29-iijmio-1year-report-en.md
```

### スラッグベースのペア検出結果

| カテゴリ | 件数 |
|---------|------|
| `-en` + `-ja` の完全ペア（slugベース） | **1組**（iijmio） |
| `-en` のみ（対応 `-ja` なし） | 7件（上記8件 - iijmio） |
| `-ja` のみ（対応 `-en` なし） | 0件 |

**結論**: ファイル名で明示的に対応付けられているのは iijmio の1ペアのみ。残り7つの英語記事には対応する `-ja.md` ファイルが存在しない。

---

## 3. frontmatter 構造分析

### lang フィールド値別件数

| 値 | 件数 |
|----|------|
| `"ja"` | 221 |
| `"en"` | 8 |
| 未設定 | 0 |

全229件に `lang` フィールドが設定されている。

### 翻訳ペアを示すフィールド

調査対象フィールド: `translationKey`, `translated_from`, `original`, `related`, `pairedSlug`

**→ 全件とも翻訳ペア情報フィールドは存在しない。**

日英の対応関係はファイル内では管理されていない。

---

## 4. 英語記事の機械判定 vs lang 設定の整合性チェック

### 判定方法

- **タイトル英語率**: タイトル文字列の ASCII 比率 > 60% → 英語タイトルと判定
- **本文英語率**: HTML タグ・URL 除去後の ASCII 比率 → サンプル確認

### 判定結果

| カテゴリ | 件数 |
|---------|------|
| `lang: "en"` かつ英語タイトル | 8（正常） |
| `lang: "ja"` かつ英語タイトル（ASCII > 60%） | **85件** |
| `lang: "ja"` かつ日本語タイトル | 136件（正常） |

### 85件の内訳

| サブカテゴリ | 件数 | 説明 |
|------------|------|------|
| タイトル ASCII > 95%（純英語タイトル） | 79件 | 本文も英語（サンプル確認済み） |
| タイトル ASCII 60〜95%（日英混在タイトル） | 6件 | 初期（2025-04〜06-01）の二言語タイトル記事 |

### 本文英語率（サンプル確認）

HTML タグ・URL 除去後の本文 ASCII 比率で確認した結果、純英語タイトルの記事は**本文も英語（ASCII 0.95〜1.00）**であることを確認。

| ファイル | 本文 ASCII 率 | lang |
|---------|-------------|------|
| `2026-04-26-izumi-no-mori-yamato-...md` | 1.00 | ja ← **要修正** |
| `2026-04-23-what-if-i-put-a-figurine-...md` | 0.99 | ja ← **要修正** |
| `2025-06-10-in-my-50s-i-asked-myself-...md` | 0.95 | ja ← **要修正** |
| `2025-06-15-mt-takaos-hidden-trail-...md` | 0.98 | ja ← **要修正** |
| `2026-03-20-the-day-i-noticed-the-scent-...md` | 0.98 | ja ← **要修正** |

### ⚠️ 重要発見：英語記事なのに lang:ja の全77件（EN_SLUGS 未登録）

タイトル ASCII > 95% かつ `lang: "ja"` かつ EN_SLUGS 未登録の記事。
これらは**本文も英語**だが、現在 `freelife50.com`（日本語ドメイン）で公開されており、
en.freelife50.com への分離が未実施。

```
date       | ファイル名
-----------|--------------------------------------------------------------
2025-06-10 | 2025-06-10-in-my-50s-i-asked-myself-is-this-really-it-and-took-a-step-with-blogging.md
2025-06-10 | 2025-06-10-only-three-pitches-left-and-i-still-throw.md
2025-06-11 | 2025-06-11-even-if-i-forget-youre-still-here-can-chatgpt-be-our-future-companion.md
2025-06-13 | 2025-06-13-three-bowls-all-gone-a-ramen-adventure-at-the-yokohama-museum-in-my-50s.md
2025-06-15 | 2025-06-15-mt-takaos-hidden-trail-a-quiet-escape-few-ever-find.md
2025-06-16 | 2025-06-16-notepin-my-future-second-brain-but-do-i-really-need-it.md
2025-06-19 | 2025-06-19-two-subarus-one-legacy-what-mf-ghost-inherits-from-initial-d.md
2025-06-21 | 2025-06-21-title-my-back-hurt-so-i-couldnt-run-anymore-but-i-could-still-swim-a-gentle-restart-in-my-50s.md
2025-06-22 | 2025-06-22-the-day-i-finally-chose-to-choose-a-quiet-shift-toward-the-ballot-box.md
2025-06-26 | 2025-06-26-if-smart-rings-could-care-6-future-features-we-quietly-wish-for.md
2025-06-30 | 2025-06-30-corewarm-and-the-quiet-heat-a-belly-wrap-journey-in-your-50s.md
2025-07-01 | 2025-07-01-crafted-in-japan-the-250-pillow-that-changed-how-i-sleep-in-my-50s.md
2025-07-07 | 2025-07-07-a-black-swiss-beauty-in-your-bathroom-when-a-toothbrush-feels-like-a-rolex.md
2025-07-09 | 2025-07-09-could-underwear-fix-my-posture.md
2025-07-10 | 2025-07-10-to-that-slouching-back-i-care-about-a-gentle-gift-of-posture-and-gratitude.md
2025-07-14 | 2025-07-14-rethinking-from-the-feet-up-how-1-second-slip-on-shoes-bring-dignity-and-ease.md
2025-07-19 | 2025-07-19-who-are-these-elections-really-for-write-democratic-party-and-your-vote-goes-to-the-cdp.md
2025-07-20 | 2025-07-20-shaving-is-a-pain-but-this-isnt-just-about-beauty-is-it.md
2025-07-23 | 2025-07-23-chosen-by-disaster-prevention-experts-and-firefighters-in-depth-review-of-the-akamaru-emergency-44-piece-survival-kit.md
2025-07-26 | 2025-07-26-the-illusion-of-reform-the-hidden-truth-behind-the-ban-on-furusato-tax-points.md
2025-07-27 | 2025-07-27-a-gift-that-cares-for-her-skin-why-i-chose-coco_makana.md
2025-08-04 | 2025-08-04-because-theyre-family-too-choosing-paws-green-deli-with-care.md
2025-08-12 | 2025-08-12-a-50-something-guy-goes-to-a-fest-the-isekai-reincarnation-arc.md
2025-08-15 | 2025-08-15-a-50-something-guy-becomes-a-detective-the-mystery-of-the-monitor-and-the-wallpaper.md
2025-08-16 | 2025-08-16-a-50-something-guy-my-quest-to-become-the-spicy-king.md
2025-08-19 | 2025-08-19-how-a-50-year-old-man-found-youth-in-a-japanese-vending-machine-sparkling-aquarius-for-just-150-yen.md
2025-08-22 | 2025-08-22-a-50-year-old-guy-vs-the-wall-of-jiro-ramen-finishing-a-giant-bowl-with-all-the-toppings.md
2025-08-24 | 2025-08-24-a-50-year-old-man-becoming-the-pillar-of-sake-breathing-showdown-in-my-wifes-infinity-castle.md
2025-08-30 | 2025-08-30-a-middle-aged-mans-journey-from-pool-laps-to-becoming-an-astronaut-with-underwater-earphones.md
2025-09-02 | 2025-09-02-__trashed-3.md  ← trashed 記事（要確認）
2025-09-04 | 2025-09-04-a-50-year-old-mans-guide-5-essential-apps-for-typhoon-days.md
2025-09-07 | 2025-09-07-a-50-year-old-mans-challenge-with-dental-implants-part-1.md
2025-09-15 | 2025-09-15-50s-mens-health-a-new-era-in-checkups-pcct-for-low-radiation-x-high-precision.md
2025-09-19 | 2025-09-19-a-50s-mans-challenge-with-dental-implants-part-2.md
2025-09-21 | 2025-09-21-a-50-year-old-mans-journey-no-more-fear.md
2025-09-26 | 2025-09-26-shocked-by-my-sons-gen-z-values.md
2025-09-28 | 2025-09-28-pain-relief-tips-why-mammogram-compression-matters.md
2025-09-30 | 2025-09-30-mris-loud-live-show-water-instruments-played-by-a-giant-magnet-a-50s-guy-explains-the-magic.md
2025-10-04 | 2025-10-04-50s-comeback-story-from-almost-extraction-to-recovery-in-3-weeks-how-dual-action-toothpaste-x-toothbrush-routine-dramatically-improved-my-periodontit.md
2025-10-05 | 2025-10-05-real-talk-in-your-50s-the-3-in-1-card-japans-myna-drivers-license-lightens-your-wallet.md
2025-10-06 | 2025-10-06-the-50s-decision-im-not-worth-1-an-hour-why-i-chose-to-save-my-life-not-just-my-money.md
2025-10-13 | 2025-10-13-the-minimalist-revolution-in-my-50s-how-ditching-my-wallet-made-my-life-lighter.md
2025-10-14 | 2025-10-14-dog-friendly-trip-because-i-just-wanted-to-ride-a-ferry-a-rainy-day-drive-across-tokyo-bay.md
2025-10-18 | 2025-10-18-proved-in-the-rain-a-50s-hikers-challenge-in-tanzawa.md
2025-10-22 | 2025-10-22-the-night-a-middle-aged-man-almost-cried-in-an-ocean-of-orange-light.md
2025-10-26 | 2025-10-26-1700-car-inspection-and-15-years-of-family-memories.md
2025-11-02 | 2025-11-02-review-imeea-double-wall-stainless-ramen-bowl-totally-worth-it.md
2025-11-05 | 2025-11-05-a-50-year-olds-gentle-hike-up-mt-ono.md
2025-11-07 | 2025-11-07-waking-up-at-4-a-m-changed-my-life.md
2025-11-11 | 2025-11-11-a-50-year-olds-reflection-in-yushin-valley.md
2025-11-16 | 2025-11-16-a-50-year-olds-secret-sanctuary-the-sagamihara-planetarium-3-50-is-a-hidden-gem.md
2025-11-23 | 2025-11-23-doggyman-white-vs-green-which-whident-chew-is-best.md
2025-11-25 | 2025-11-25-kanagawa-japan.md
2025-11-26 | 2025-11-26-why-a-50-year-old-guy-becomes-a-rookie-star-at-the-pool-on-weekdays.md
2025-12-07 | 2025-12-07-ultra-time-efficient-a-50-year-old-guy-conquered-two-1700m-peaks-in-just-2-5-hours.md
2025-12-10 | 2025-12-10-urgent-bra-tops-are-the-ultimate-no-go.md
2025-12-14 | 2025-12-14-a-man-in-his-50s-torn-between-ai-subscriptions.md
2025-12-18 | 2025-12-18-a-man-in-his-50s-finally-bought-an-iphone-17.md
2025-12-20 | 2025-12-20-closed-hachioji-taishoken.md
2025-12-28 | 2025-12-28-a-man-in-his-50s-goes-to-see-avatar.md
2025-12-31 | 2025-12-31-a-surprisingly-quiet-sunday-at-year-end-a-no-regret-walking-guide-to-machida-yakushiike-park.md
2026-01-07 | 2026-01-07-a-50-something-man-pauses-in-front-of-a-supermarket-price-tag.md
2026-01-07 | 2026-01-07-most-unsolicited-offers-are-better-refused-my-story.md
2026-01-09 | 2026-01-09-i-thought-id-be-fine-the-moment-that-gave-a-50-something-a-chill.md
2026-01-15 | 2026-01-15-theres-a-mt-takao-in-yokohama-you-know.md
2026-01-26 | 2026-01-26-a-50-something-guy-visits-ichiyajo-at-0c-walking-with-my-dog-to-clear-my-mind.md
2026-02-02 | 2026-02-02-i-seriously-underestimated-hachioji-castle-ruins.md
2026-02-13 | 2026-02-13-from-tateishi-to-mt-okusu-in-0c-snow-and-the-life-saving-lunch-pack-4h-09m-to-kinugasa.md
2026-03-01 | 2026-03-01-mt-takao-walked-with-my-son.md
2026-03-10 | 2026-03-10-the-night-i-ran-out-of-blog-ideas-i-decided-to-become-a-beer-livestreamer.md
2026-03-17 | 2026-03-17-is-kinchakuda-manjushage-park-good-for-walking-with-dogs.md
2026-03-20 | 2026-03-20-the-day-i-noticed-the-scent-of-sakura-and-my-shiba-inu-who-only-cared-about-the-river.md
2026-04-04 | 2026-04-04-hiking-kobo-yama-bbq-a-perfect-spring-day-close-to-the-city.md
2026-04-15 | 2026-04-15-coffee-addicts-weight-loss-just-switch-your-daily-brew.md
2026-04-18 | 2026-04-18-could-i-quietly-gift-this-to-my-wife-researching-the-magic-brush-from-reiwa-no-tora.md
2026-04-23 | 2026-04-23-what-if-i-put-a-figurine-of-my-late-parents-on-the-buddhist-altar-would-it-feel-like-they-are-still-here.md
2026-04-26 | 2026-04-26-izumi-no-mori-yamato-a-free-dog-friendly-walk-where-old-japan-eased-my-mind.md
```

---

## 5. 日英ペアのサンプル10組

同日付で JA（日本語タイトル）と EN（英語タイトル）のペアが存在する例。
EN 側は現在 `lang: "ja"` のまま freelife50.com に公開されている。

| # | 日付 | 日本語版 | 英語版 | EN lang |
|---|------|---------|--------|---------|
| 1 | 2025-06-11 | 高齢化社会に寄り添うAI〜ChatGPTは孤独の時代の相棒になれるか？ | Can ChatGPT Fight Loneliness? How AI Could Become a Companion for Aging | `ja` |
| 2 | 2025-06-13 | スープまで飲み干した3杯！横浜ラーメン博物館 | Shin-Yokohama Ramen Museum: 3 Bowls I Couldn't Stop Eating | `ja` |
| 3 | 2025-06-15 | 【裏高尾・小仏城山】静けさを歩く | Ura-Takao Hidden Trail Guide: A Peaceful Hike from Kobotoke-Shiroyama | `ja` |
| 4 | 2025-06-30 | CoreWarm腹巻レビュー：夏でも腹巻はアリ | CoreWarm Belly Wrap Review: Japanese Haramaki for Weight Loss and Warmth | `ja` |
| 5 | 2025-07-23 | 防災士と消防士が選んだ あかまる防災44点セット | Akamaru Emergency Kit Review: 44-Piece Survival Set Chosen by Disaster Experts | `ja` |
| 6 | 2025-08-22 | ラーメン二郎 全マシに50代が挑戦！ | Eating at Ramen Jiro: Can a 50-Year-Old Finish a Full Toppings Large Bowl? | `ja` |
| 7 | 2025-10-06 | 自分は時給100円じゃない〜50代の決意 | Time vs Money in Your 50s: Why I Chose to Save My Life, Not Just My Budget | `ja` |
| 8 | 2025-11-05 | 【大野山ハイキング】静かな頂上から富士山を望む | Mt. Ono Hiking in Kanagawa: Easy Trail with Stunning Mt. Fuji Views for Beginners | `ja` |
| 9 | 2026-03-01 | 息子と歩いた高尾山、稲荷山コースの意外な出会い | Hiking Mt. Takao with My Son: Inariyama Trail to Yakuo-in and a Strange Reunion | `ja` |
| 10 | 2026-04-26 | 大和市・泉の森で柴犬と散歩した。昔の日本に救われた話 | Izumi no Mori, Yamato: A Free Dog-Friendly Walk Where Old Japan Eased My Mind | `ja` |

---

## 6. 全記事 CSV（先頭50件・残り179件省略）

```csv
file,lang,title_excerpt,slug,date
2025-04-16-はじめまして-ラーメンとビールと-時々ブログ.md,ja,はじめまして！ラーメンとビールと、時々ブログ始めました…,はじめまして-ラーメンとビールと-時々ブログ,2025-04-16
2025-04-17-health-check-running.md,ja,健康診断に向けて運動スタート！…,health-check-running,2025-04-17
2025-04-18-ジムで10分走って-ビールで乾杯-50代の挑戦.md,ja,「ジムで10分走って、ビールで乾杯！50代の挑戦」…,ジムで10分走って-ビールで乾杯-50代の挑戦,2025-04-18
2025-04-19-__trashed.md,ja,ステーキとランニングと、岡本太郎に呼ばれた朝…,__trashed,2025-04-19
2025-04-19-山と海と-もみじと妻と-そして-アジフラ.md,ja,🌊山と海と、もみじと妻と。そして、アジフライとビール。…,山と海と-もみじと妻と-そして-アジフラ,2025-04-19
... (229件分の完全データは src/content/blog/ を直接参照)
```

> 完全な CSV データは以下で取得可能:
> ```bash
> cd src/content/blog && grep -h "^title:\|^lang:\|^slug:\|^date:" *.md
> ```

---

## 7. 現状の問題点と今後の対応方針（提案）

### 現状整理

```
【現在の状態】
freelife50.com（日本語ドメイン）に存在する英語記事:
  ├── 8件: lang: "en"、スラッグに -en あり → EN_SLUGS 登録済み → en. に正しく分離
  └── 77件: lang: "ja"、スラッグに -en なし → EN_SLUGS 未登録 → 日本語サイトに露出中
         └── うち最新: 2026-04-26 izumi-no-mori-yamato-...
         └── 最古: 2025-06-10 in-my-50s-i-asked-myself-...
```

### Phase 2 対応が必要な77件の処理選択肢

| 選択肢 | 内容 | メリット | リスク |
|------|------|---------|------|
| A: `lang: "ja"` → `lang: "en"` に修正 + EN_SLUGS に追加 | 正しく英語記事として分類・en. に移行 | SEO的に正しい | Google が既存URLを EN スラッグとして認識済みのため 301 が必要 |
| B: 現状維持 | freelife50.com で英語記事を公開し続ける | 影響なし | 日英混在サイトのまま（Google が混乱する可能性） |
| C: 英語記事を非公開 → 日本語版のみ残す | JPドメインを完全日本語化 | SEO クリーン | 英語コンテンツ資産を失う |

### 推奨アクション順序（次回作業時）

1. **77件の英語記事スラッグを確認** → EN_SLUGS リストを更新する場合の影響確認
2. **Google Search Console で現在の英語記事の検索流入を確認**（インデックス済み・流入があれば 301 必須）
3. **段階的移行を推奨**: 流入のある英語記事から優先的に EN_SLUGS 追加 + `lang: "en"` 修正

---

## 8. 現在の正常動作を妨げない確認事項

- `lang: "ja"` のまま英語記事が freelife50.com に残っている状態でも、現在の Worker・Astro の動作は壊れていない
- en.freelife50.com は8件のみを対象として正常稼働中
- 77件の英語記事は freelife50.com 上で正常にアクセス可能（URL は生きている）
- **今すぐ対応が必須の問題ではない** — Phase 2 移行として計画的に実施すること
