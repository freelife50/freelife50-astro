# 緊急現状確認 — 調査レポート

**実施日**: 2026-05-02  
**対象**: `src/content/blog/` 全229件  
**目的**: 英語記事実数の確認 / アイキャッチ画像状態の確認  
**方針**: 調査のみ・ファイル変更なし

---

## 確認1：英語記事の実数

### ディレクトリ構造

| パス | 状態 |
|------|------|
| `src/content/blog/` | ✅ 存在（229ファイル） |
| `src/content/posts/` | ❌ 存在しない |

`src/content/` 配下は `blog/` のみ。全記事が1ディレクトリに集約されている。

---

### `lang: "en"` 記事一覧（85件）

| # | 日付 | スラッグ | タイトル |
|---|------|----------|---------|
| 1 | 2025-06-10 | `in-my-50s-i-asked-myself-is-this-really-it-and-took-a-step-with-blogging` | Starting a Blog at 50: How Taking One Small Step Changed My Perspective |
| 2 | 2025-06-10 | `only-three-pitches-left-and-i-still-throw` | Life Philosophy at 50: What Can You Do with Your Last Three Pitches? |
| 3 | 2025-06-11 | `even-if-i-forget-youre-still-here-can-chatgpt-be-our-future-companion` | Can ChatGPT Fight Loneliness? How AI Could Become a Companion for Aging Populations |
| 4 | 2025-06-13 | `three-bowls-all-gone-a-ramen-adventure-at-the-yokohama-museum-in-my-50s` | Shin-Yokohama Ramen Museum: 3 Bowls I Couldn't Stop Eating (Honest Food Review) |
| 5 | 2025-06-15 | `mt-takaos-hidden-trail-a-quiet-escape-few-ever-find` | Ura-Takao Hidden Trail Guide: A Peaceful Hike from Kobotoke-Shiroyama Near Tokyo |
| 6 | 2025-06-16 | `notepin-my-future-second-brain-but-do-i-really-need-it` | Plaud NotePin Review: Why I Haven't Bought This AI Wearable Yet |
| 7 | 2025-06-19 | `two-subarus-one-legacy-what-mf-ghost-inherits-from-initial-d` | MF Ghost and Initial D Connection: Two Subarus, One Legacy for Takumi Fans |
| 8 | 2025-06-21 | `title-my-back-hurt-so-i-couldnt-run-anymore-but-i-could-still-swim-a-gentle-restart-in-my-50s` | From Running Injury to Swimming: A 50-Year-Old's Comeback Story with Back Pain |
| 9 | 2025-06-22 | `the-day-i-finally-chose-to-choose-a-quiet-shift-toward-the-ballot-box` | Why I Finally Started Voting in Japan: A Quiet Shift Toward the Ballot Box at 50 |
| 10 | 2025-06-26 | `if-smart-rings-could-care-6-future-features-we-quietly-wish-for` | Smart Ring Wishlist: 6 Future Features That Would Make Me Buy One Instantly |
| 11 | 2025-06-30 | `corewarm-and-the-quiet-heat-a-belly-wrap-journey-in-your-50s` | CoreWarm Belly Wrap Review: Japanese Haramaki for Weight Loss and Warmth |
| 12 | 2025-07-01 | `crafted-in-japan-the-250-pillow-that-changed-how-i-sleep-in-my-50s` | Japanese Premium Pillow Review: Is a $250 Pillow Worth It for Better Sleep in Your 50s? |
| 13 | 2025-07-07 | `a-black-swiss-beauty-in-your-bathroom-when-a-toothbrush-feels-like-a-rolex` | Curaprox Toothbrush Review: When a Swiss Toothbrush Feels Like Owning a Rolex |
| 14 | 2025-07-09 | `could-underwear-fix-my-posture` | Can Posture-Correcting Underwear Really Fix Your Back? A 50-Year-Old's Honest Review |
| 15 | 2025-07-10 | `to-that-slouching-back-i-care-about-a-gentle-gift-of-posture-and-gratitude` | Posture Correction Shorts Review: A Thoughtful Gift for Your Aging Parents |
| 16 | 2025-07-14 | `rethinking-from-the-feet-up-how-1-second-slip-on-shoes-bring-dignity-and-ease` | 1-Second Slip-On Shoes Review: How Easy Footwear Brings Dignity to Aging in Japan |
| 17 | 2025-07-19 | `who-are-these-elections-really-for-write-democratic-party-and-your-vote-goes-to-the-cdp` | Japan Election Problems: How a Naming Trick Steals Votes from Voters |
| 18 | 2025-07-20 | `shaving-is-a-pain-but-this-isnt-just-about-beauty-is-it` | Men's Grooming in Your 50s: Is It Worth Ditching the Razor for Good? |
| 19 | 2025-07-23 | `chosen-by-disaster-prevention-experts-and-firefighters-in-depth-review-of-the-akamaru-emergency-44-piece-survival-kit` | Akamaru Emergency Kit Review: 44-Piece Survival Set Chosen by Disaster Experts |
| 20 | 2025-07-26 | `the-illusion-of-reform-the-hidden-truth-behind-the-ban-on-furusato-tax-points` | Japan's Furusato Tax Points Ban: The Hidden Truth Behind This Tax Reform |
| 21 | 2025-07-27 | `a-gift-that-cares-for-her-skin-why-i-chose-coco_makana` | coco_Makana Skincare Review: A Thoughtful Birthday Gift for Her |
| 22 | 2025-08-04 | `because-theyre-family-too-choosing-paws-green-deli-with-care` | PAW'S GREEN DELI Review: Premium Natural Dog Food for Your Furry Family Member |
| 23 | 2025-08-12 | `a-50-something-guy-goes-to-a-fest-the-isekai-reincarnation-arc` | Music Festival at 50: An Isekai-Level Culture Shock Experience in Japan |
| 24 | 2025-08-15 | `a-50-something-guy-becomes-a-detective-the-mystery-of-the-monitor-and-the-wallpaper` | Tech Troubleshooting: A 50-Year-Old Detective Solves the Mystery of the Disappearing Wallpaper |
| 25 | 2025-08-16 | `a-50-something-guy-my-quest-to-become-the-spicy-king` | Mouko Tanmen Nakamoto Challenge: Can a 50-Year-Old Handle 10x Spicy Hokkyoku Ramen? |
| 26 | 2025-08-19 | `how-a-50-year-old-man-found-youth-in-a-japanese-vending-machine-sparkling-aquarius-for-just-150-yen` | Sparkling Aquarius Japan Review: How a Vending Machine Drink Revived My Youth at 50 |
| 27 | 2025-08-22 | `a-50-year-old-guy-vs-the-wall-of-jiro-ramen-finishing-a-giant-bowl-with-all-the-toppings` | Eating at Ramen Jiro: Can a 50-Year-Old Finish a Full Toppings Large Bowl? |
| 28 | 2025-08-24 | `a-50-year-old-man-becoming-the-pillar-of-sake-breathing-showdown-in-my-wifes-infinity-castle` | Demon Slayer Parody: A 50-Year-Old Becomes the Sake Breathing Pillar |
| 29 | 2025-08-30 | `a-middle-aged-mans-journey-from-pool-laps-to-becoming-an-astronaut-with-underwater-earphones` | Swimming with Underwater Earphones: A 50-Year-Old's Journey to Feeling Like an Astronaut |
| 30 | 2025-09-02 | `__trashed-3` | Furusato Nozei Explained: A 50-Year-Old Japanese Man's Honest Reflections ※削除済み・非公開 |
| 31 | 2025-09-04 | `a-50-year-old-mans-guide-5-essential-apps-for-typhoon-days` | 5 Must-Have Apps for Typhoon Season in Japan: A 50-Year-Old's Guide |
| 32 | 2025-09-07 | `a-50-year-old-mans-challenge-with-dental-implants-part-1` | Dental Implant Journey Part 1: Why a 50-Year-Old Japanese Man Chose Implants |
| 33 | 2025-09-15 | `50s-mens-health-a-new-era-in-checkups-pcct-for-low-radiation-x-high-precision` | PCCT Scanner Explained: The Future of Low-Radiation Health Checkups in Your 50s |
| 34 | 2025-09-19 | `a-50s-mans-challenge-with-dental-implants-part-2` | Dental Implant Journey Part 2: A 50-Year-Old's Treatment Progress in Japan |
| 35 | 2025-09-21 | `a-50-year-old-mans-journey-no-more-fear` | Colon CT Scan Experience: A 50-Year-Old Japanese Man's Honest Review |
| 36 | 2025-09-26 | `shocked-by-my-sons-gen-z-values` | Gen X vs Gen Z Values: What My Son's Generation Taught Me About Life in Japan |
| 37 | 2025-09-28 | `pain-relief-tips-why-mammogram-compression-matters` | Why Mammogram Compression Matters: Pain Relief Tips and What to Expect |
| 38 | 2025-09-30 | `mris-loud-live-show-water-instruments-played-by-a-giant-magnet-a-50s-guy-explains-the-magic` | How MRI Machines Work: A Radiologist Explains Why They're So Loud |
| 39 | 2025-10-04 | `50s-comeback-story-from-almost-extraction-to-recovery-in-3-weeks-how-dual-action-toothpaste-x-toothbrush-routine-dramatically-improved-my-periodontit` | Gum Disease Recovery at 50: How a Toothpaste & Toothbrush Combo Saved My Teeth in 3 Weeks |
| 40 | 2025-10-05 | `real-talk-in-your-50s-the-3-in-1-card-japans-myna-drivers-license-lightens-your-wallet` | Japan MyNumber Driver's License Review: 3-in-1 Card That Lightens Your Wallet |
| 41 | 2025-10-06 | `the-50s-decision-im-not-worth-1-an-hour-why-i-chose-to-save-my-life-not-just-my-money` | Time vs Money in Your 50s: Why I Chose to Save My Life, Not Just My Budget |
| 42 | 2025-10-13 | `the-minimalist-revolution-in-my-50s-how-ditching-my-wallet-made-my-life-lighter` | Minimalist Wallet: How Switching to a Money Clip Changed My Life at 50 |
| 43 | 2025-10-14 | `dog-friendly-trip-because-i-just-wanted-to-ride-a-ferry-a-rainy-day-drive-across-tokyo-bay` | Dog-Friendly Day Trip: Tokyo Bay Ferry to Chiba — A Rainy Day Drive with My Shiba Inu |
| 44 | 2025-10-18 | `proved-in-the-rain-a-50s-hikers-challenge-in-tanzawa` | Rainy Day Hiking in Tanzawa, Japan: Mountain Lodge Food & Workman Rain Gear Review |
| 45 | 2025-10-22 | `the-night-a-middle-aged-man-almost-cried-in-an-ocean-of-orange-light` | Kinchakuda Manjushage Festival: When a Field of Red Spider Lilies Almost Made Me Cry |
| 46 | 2025-10-26 | `1700-car-inspection-and-15-years-of-family-memories` | $1,700 Car Inspection in Japan: 15 Years of Family Memories with One Car |
| 47 | 2025-11-02 | `review-imeea-double-wall-stainless-ramen-bowl-totally-worth-it` | IMEEA Double-Wall Ramen Bowl Review: Best Insulated Bowl for Japanese Noodles |
| 48 | 2025-11-05 | `a-50-year-olds-gentle-hike-up-mt-ono` | Mt. Ono Hiking in Kanagawa: Easy Trail with Stunning Mt. Fuji Views for Beginners |
| 49 | 2025-11-07 | `waking-up-at-4-a-m-changed-my-life` | 4 AM Morning Routine: How Waking Up Early Changed My Life in My 50s |
| 50 | 2025-11-11 | `a-50-year-olds-reflection-in-yushin-valley` | Yushin Valley Autumn Hike in Kanagawa: A Reflective Walk Through Japan's Hidden Gorge |
| 51 | 2025-11-16 | `a-50-year-olds-secret-sanctuary-the-sagamihara-planetarium-3-50-is-a-hidden-gem` | Sagamihara Planetarium Review: A Hidden Gem in Japan for Just $3.50 |
| 52 | 2025-11-23 | `doggyman-white-vs-green-which-whident-chew-is-best` | DoggyMan White vs Green Whident Chew Review: Which Is Best for Your Dog? |
| 53 | 2025-11-25 | `kanagawa-japan` | Mt. Zukko Hiking in Hadano, Kanagawa: Easy Trail Perfect for Beginners Over 50 |
| 54 | 2025-11-26 | `why-a-50-year-old-guy-becomes-a-rookie-star-at-the-pool-on-weekdays` | Adult Swimming in Japan: Why This 50-Year-Old Became a "Rookie Star" at the Pool |
| 55 | 2025-12-07 | `ultra-time-efficient-a-50-year-old-guy-conquered-two-1700m-peaks-in-just-2-5-hours` | Mt. Okura-takamaru & Mt. Hamaiba-maru: Two 1700m Peaks in 2.5 Hours Near Tokyo |
| 56 | 2025-12-10 | `urgent-bra-tops-are-the-ultimate-no-go` | Japanese Fashion Tip: Why Bra Tops Are the Ultimate No-Go for Some |
| 57 | 2025-12-14 | `a-man-in-his-50s-torn-between-ai-subscriptions` | ChatGPT vs Gemini vs Claude: How a 50-Year-Old Found the Best AI Subscription Split |
| 58 | 2025-12-18 | `a-man-in-his-50s-finally-bought-an-iphone-17` | iPhone 17 Review: A 50-Year-Old Japanese Man Finally Makes the Switch |
| 59 | 2025-12-20 | `closed-hachioji-taishoken` | Hachioji Taishoken (Closed): My Last Bowl of Miso at a Legendary Ramen Shop |
| 60 | 2025-12-28 | `a-man-in-his-50s-goes-to-see-avatar` | Avatar Movie Review: A 50-Year-Old's Honest Take — Mild Emotions, Rich Experience |
| 61 | 2025-12-31 | `a-surprisingly-quiet-sunday-at-year-end-a-no-regret-walking-guide-to-machida-yakushiike-park` | Machida Yakushiike Park: A Surprisingly Quiet Year-End Walk Near Tokyo |
| 62 | 2026-01-07 | `a-50-something-man-pauses-in-front-of-a-supermarket-price-tag` | Money in Your 50s: Rethinking Where to Put Your Savings in Japan |
| 63 | 2026-01-07 | `most-unsolicited-offers-are-better-refused-my-story` | Life Advice at 50: Why Most Unsolicited Offers Are Better Refused |
| 64 | 2026-01-09 | `i-thought-id-be-fine-the-moment-that-gave-a-50-something-a-chill` | Life in Your 50s: "I Thought I'd Be Fine" — A Wake-Up Call About Personal Safety |
| 65 | 2026-01-15 | `theres-a-mt-takao-in-yokohama-you-know` | Yokohama's Hidden "Mt. Takao": A 13km Hike Through History and Stunning Views |
| 66 | 2026-01-26 | `a-50-something-guy-visits-ichiyajo-at-0c-walking-with-my-dog-to-clear-my-mind` | Dog-Friendly Winter Walk at Ishigakiyama (Ichiyajo) in Odawara, Japan |
| 67 | 2026-02-02 | `i-seriously-underestimated-hachioji-castle-ruins` | Hachioji Castle Ruins Hike: Why I Seriously Underestimated This Trail Near Tokyo |
| 68 | 2026-02-13 | `from-tateishi-to-mt-okusu-in-0c-snow-and-the-life-saving-lunch-pack-4h-09m-to-kinugasa` | Winter Hiking in Japan: Tateishi to Mt. Okusu in 0°C Snow (4h 09m Trail Report) |
| 69 | 2026-03-01 | `mt-takao-walked-with-my-son` | Hiking Mt. Takao with My Son: Inariyama Trail to Yakuo-in and a Strange Reunion |
| 70 | 2026-03-10 | `the-night-i-ran-out-of-blog-ideas-i-decided-to-become-a-beer-livestreamer` | Blogging Tips: What Happens When You Run Out of Ideas — I Became a Beer Livestreamer |
| 71 | 2026-03-17 | `is-kinchakuda-manjushage-park-good-for-walking-with-dogs` | Kinchakuda Manjushage Park: Is It Dog-Friendly? Walking with My Shiba Inu |
| 72 | 2026-03-20 | `the-day-i-noticed-the-scent-of-sakura-and-my-shiba-inu-who-only-cared-about-the-river` | Cherry Blossom Walk with My Shiba Inu in Kanagawa, Japan — A Dog-Friendly Spring Outing |
| 73 | 2026-04-04 | `hiking-kobo-yama-bbq-a-perfect-spring-day-close-to-the-city` | Hiking Kobo-yama & BBQ Near Tokyo: A Perfect Spring Day Close to the City |
| 74 | 2026-04-15 | `coffee-addicts-weight-loss-just-switch-your-daily-brew` | Coffee Addict's Weight Loss: Just Switch Your Daily Brew |
| 75 | 2026-04-16 | `komachi-shrine-takamatsu-hiking-en` | Takamatsu-yama Hiking from Komachi Shrine \| Atsugi, Kanagawa (Parking, Trail, Time) |
| 76 | 2026-04-16 | `ninomiya-sodegaura-hiking-en` | A Quiet Coastal Walk in Ninomiya with My Dog |
| 77 | 2026-04-18 | `could-i-quietly-gift-this-to-my-wife-researching-the-magic-brush-from-reiwa-no-tora` | Could I Quietly Gift This to My Wife? Researching the "Magic Brush" from Reiwa no Tora |
| 78 | 2026-04-18 | `yokohama-kodomo-shizen-park-firefly-en` | Fireflies in Yokohama? Kodomo Shizen Park with My Dog and Mt. Fuji |
| 79 | 2026-04-19 | `momiji-rabies-vaccine-en` | Momiji Knew. Taking My Shiba Inu for Her Annual Rabies Vaccine |
| 80 | 2026-04-20 | `sagami-odako-festival-2026-en` | I Took My Shiba Inu to the Sagami River and Found Japan's Largest Kite Being Built |
| 81 | 2026-04-21 | `hakone-museum-of-art-gardener-en` | My Wife Rejected the Zoo, So We Went to Hakone Museum of Art — and the Gardeners Won My Heart |
| 82 | 2026-04-23 | `what-if-i-put-a-figurine-of-my-late-parents-on-the-buddhist-altar-would-it-feel-like-they-are-still-here` | What If I Put a Figurine of My Late Parents on the Buddhist Altar — Would It Feel Like They Are Still Here? |
| 83 | 2026-04-26 | `izumi-no-mori-yamato-a-free-dog-friendly-walk-where-old-japan-eased-my-mind` | Izumi no Mori, Yamato: A Free Dog-Friendly Walk Where Old Japan Eased My Mind |
| 84 | 2026-04-28 | `grands-grain-free-dog-food-review-shiba-inu-en` | I Did the Research for My Shiba Inu: Is GRANDS Grain-Free Dog Food Worth It? |
| 85 | 2026-04-29 | `iijmio-1year-report-en` | One Year with IIJmio: I Said '$30/Month for 4 People' — Here's the Honest Truth |

**合計: 85件**（うち `__trashed-3` は非公開のため EN_SLUGS・en/index 対象外）

---

### ファイル名に "en" を含むが `lang: "en"` でない記事（誤判定候補）

| # | ファイル名 | lang | 理由 |
|---|-----------|------|------|
| 1 | `2025-05-22-adsenseに何度も落ちた僕が-それでも申請し続けた.md` | ja | "en" は "adsense" の部分文字列。日本語記事 |
| 2 | `2026-04-18-yokohama-kodomo-shizen-park-firefly.md` | ja | `-en` サフィックスなしの日本語版。対応英語版 `...-firefly-en.md` は lang:en 済み |
| 3 | `2026-04-21-hakone-museum-of-art-gardener.md` | ja | `-en` サフィックスなしの日本語版。対応英語版 `...-gardener-en.md` は lang:en 済み |

→ **修正が必要な記事はゼロ**。3件はいずれも意図通りの lang:ja。

---

### WordPress エクスポート XML との比較

| 項目 | 状態 |
|------|------|
| `~/Downloads/ramenbeerampblog.WordPress.2026-04-29.xml` | ❌ **ファイルが存在しない** |
| Downloads 配下の .xml ファイル | なし（xmlファイル0件） |
| `~/` 全体での .xml 検索 | 対象ファイルなし |

**仮説**: 2026-04-29 の WordPress エクスポートは実行されていないか、別の場所（Google Drive 等）に保存・または削除済みの可能性。現在の `src/content/blog/` に229件が揃っているため、実運用上の差分調査に XML は不要。

---

## 確認2：アイキャッチ画像の状態

### サマリー

| 指標 | 値 |
|------|-----|
| 全記事数 | 229件 |
| eyecatch フィールド あり | **228件** |
| eyecatch フィールド なし（空・未設定含む） | **1件** |
| lang:en 記事でのeyecatch欠損 | **0件** |
| 画像ファイルのリンク切れ | **0件** ✅ |
| 重複画像パス（複数記事が同一画像を使用） | **78ペア** |

---

### eyecatch 未設定の記事（1件）

| ファイル | lang | タイトル |
|---------|------|---------|
| `2025-08-04-家族だから-食べるものにもやさしさを.md` | ja | 【PAW'S GREEN DELIレビュー】愛犬の食事にやさしさを。無添加ドッグフードの選び方 |

- 同日に英語版 `2025-08-04-because-theyre-family-too-...` が存在し、そちらは eyecatch あり
- en.freelife50.com の表示には影響なし（lang:ja のため英語サイト対象外）
- **修正推奨**: 日本語版に英語版と同じ eyecatch 画像パスを設定

---

### リンク切れ（画像ファイル不存在）

**0件** — `public/images/` 配下のファイル実在確認で全228パスが正常。

---

### 重複画像パス TOP10（2件使用・全ペア）

すべて **日本語版と英語版の記事ペア** が同一画像を共有しているケース（意図通り）。

| 画像パス |
|---------|
| `/images/wp-content/uploads/2026/04/iijmio-1year-eyecatch.jpg` |
| `/images/wp-content/uploads/2026/04/izumi_momiji_eyecatch-1.jpg` |
| `/images/wp-content/uploads/2026/04/odako_3297-1.jpg` |
| `/images/wp-content/uploads/2026/04/upload_3286-1.jpg` |
| `/images/wp-content/uploads/2026/04/hairstar_eyecatch.jpg` |
| `/images/wp-content/uploads/2026/04/grands_01_eyecatch.jpg` |
| `/images/wp-content/uploads/2026/04/digxipop-eyecatch.jpg` |
| `/images/wp-content/uploads/2026/04/IMG_3097.jpg` |
| `/images/wp-content/uploads/2026/04/IMG_2773.jpg` |
| `/images/wp-content/uploads/2026/04/Gemini_Generated_Image_5usz3j5usz3j5usz.jpg` |

重複78ペアはすべて「JA版とEN版が同一eyecatchを共有」というパターン。  
→ **問題なし**。画像の日英共通使用は設計通り。

---

## 総合アセスメント

| 確認項目 | 結果 | 対応要否 |
|---------|------|---------|
| src/content/posts/ は存在するか | ❌ 存在しない（blog/ のみ） | 不要 |
| lang:en 記事数 | ✅ 85件（正確） | 不要 |
| 誤ってlang:jaのまま残った英語記事 | ✅ ゼロ | 不要 |
| WordPress XMLとの差分 | ⚠️ XMLなし（確認不能） | 任意（XMLを入手できれば） |
| eyecatch 欠損（lang:en） | ✅ ゼロ | 不要 |
| eyecatch 欠損（lang:ja） | 1件 (`2025-08-04-家族...`) | 任意（JP表示のみ影響） |
| 画像リンク切れ | ✅ ゼロ | 不要 |
| 重複画像パス | 78ペア（全て意図的なJA/EN共有） | 不要 |

**ロールバック不要。現状は安定稼働中。**
