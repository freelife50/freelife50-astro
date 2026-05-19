// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Cloudflare Pages Advanced Mode Worker
// dist/_worker.js を生成してホスト名ベースのルーティングを実装する。
//
// en.freelife50.com/ → /en/ のコンテンツをリライト（URLは en. のまま）
// en.freelife50.com/[ja-slug] → freelife50.com/[ja-slug] に 301 リダイレクト
// freelife50.com/[en-slug]  → en.freelife50.com/[en-slug] に 301 リダイレクト
// その他 → 通常の静的配信（env.ASSETS.fetch）
// ---------------------------------------------------------------------------
const EN_SLUGS = [
  // ── 2026-04 以降（-en サフィックス付き・初期8件）──────────────────
  'komachi-shrine-takamatsu-hiking-en',
  'ninomiya-sodegaura-hiking-en',
  'yokohama-kodomo-shizen-park-firefly-en',
  'momiji-rabies-vaccine-en',
  'sagami-odako-festival-2026-en',
  'sagamihara-oodako-matsuri-2025-en',
  'hakone-museum-of-art-gardener-en',
  'grands-grain-free-dog-food-review-shiba-inu-en',
  'iijmio-1year-report-en',
  // ── 2025-06〜2026-04（lang:en に修正した76件）─────────────────────
  'in-my-50s-i-asked-myself-is-this-really-it-and-took-a-step-with-blogging',
  'only-three-pitches-left-and-i-still-throw',
  'even-if-i-forget-youre-still-here-can-chatgpt-be-our-future-companion',
  'three-bowls-all-gone-a-ramen-adventure-at-the-yokohama-museum-in-my-50s',
  'mt-takaos-hidden-trail-a-quiet-escape-few-ever-find',
  'notepin-my-future-second-brain-but-do-i-really-need-it',
  'two-subarus-one-legacy-what-mf-ghost-inherits-from-initial-d',
  'title-my-back-hurt-so-i-couldnt-run-anymore-but-i-could-still-swim-a-gentle-restart-in-my-50s',
  'the-day-i-finally-chose-to-choose-a-quiet-shift-toward-the-ballot-box',
  'if-smart-rings-could-care-6-future-features-we-quietly-wish-for',
  'corewarm-and-the-quiet-heat-a-belly-wrap-journey-in-your-50s',
  'crafted-in-japan-the-250-pillow-that-changed-how-i-sleep-in-my-50s',
  'a-black-swiss-beauty-in-your-bathroom-when-a-toothbrush-feels-like-a-rolex',
  'could-underwear-fix-my-posture',
  'to-that-slouching-back-i-care-about-a-gentle-gift-of-posture-and-gratitude',
  'rethinking-from-the-feet-up-how-1-second-slip-on-shoes-bring-dignity-and-ease',
  'who-are-these-elections-really-for-write-democratic-party-and-your-vote-goes-to-the-cdp',
  'shaving-is-a-pain-but-this-isnt-just-about-beauty-is-it',
  'chosen-by-disaster-prevention-experts-and-firefighters-in-depth-review-of-the-akamaru-emergency-44-piece-survival-kit',
  'the-illusion-of-reform-the-hidden-truth-behind-the-ban-on-furusato-tax-points',
  'a-gift-that-cares-for-her-skin-why-i-chose-coco_makana',
  'because-theyre-family-too-choosing-paws-green-deli-with-care',
  'a-50-something-guy-goes-to-a-fest-the-isekai-reincarnation-arc',
  'a-50-something-guy-becomes-a-detective-the-mystery-of-the-monitor-and-the-wallpaper',
  'a-50-something-guy-my-quest-to-become-the-spicy-king',
  'how-a-50-year-old-man-found-youth-in-a-japanese-vending-machine-sparkling-aquarius-for-just-150-yen',
  'a-50-year-old-guy-vs-the-wall-of-jiro-ramen-finishing-a-giant-bowl-with-all-the-toppings',
  'a-50-year-old-man-becoming-the-pillar-of-sake-breathing-showdown-in-my-wifes-infinity-castle',
  'a-middle-aged-mans-journey-from-pool-laps-to-becoming-an-astronaut-with-underwater-earphones',
  'a-50-year-old-mans-guide-5-essential-apps-for-typhoon-days',
  'a-50-year-old-mans-challenge-with-dental-implants-part-1',
  '50s-mens-health-a-new-era-in-checkups-pcct-for-low-radiation-x-high-precision',
  'a-50s-mans-challenge-with-dental-implants-part-2',
  'a-50-year-old-mans-journey-no-more-fear',
  'shocked-by-my-sons-gen-z-values',
  'pain-relief-tips-why-mammogram-compression-matters',
  'mris-loud-live-show-water-instruments-played-by-a-giant-magnet-a-50s-guy-explains-the-magic',
  '50s-comeback-story-from-almost-extraction-to-recovery-in-3-weeks-how-dual-action-toothpaste-x-toothbrush-routine-dramatically-improved-my-periodontit',
  'real-talk-in-your-50s-the-3-in-1-card-japans-myna-drivers-license-lightens-your-wallet',
  'the-50s-decision-im-not-worth-1-an-hour-why-i-chose-to-save-my-life-not-just-my-money',
  'the-minimalist-revolution-in-my-50s-how-ditching-my-wallet-made-my-life-lighter',
  'dog-friendly-trip-because-i-just-wanted-to-ride-a-ferry-a-rainy-day-drive-across-tokyo-bay',
  'proved-in-the-rain-a-50s-hikers-challenge-in-tanzawa',
  'the-night-a-middle-aged-man-almost-cried-in-an-ocean-of-orange-light',
  '1700-car-inspection-and-15-years-of-family-memories',
  'review-imeea-double-wall-stainless-ramen-bowl-totally-worth-it',
  'a-50-year-olds-gentle-hike-up-mt-ono',
  'waking-up-at-4-a-m-changed-my-life',
  'a-50-year-olds-reflection-in-yushin-valley',
  'a-50-year-olds-secret-sanctuary-the-sagamihara-planetarium-3-50-is-a-hidden-gem',
  'doggyman-white-vs-green-which-whident-chew-is-best',
  'kanagawa-japan',
  'why-a-50-year-old-guy-becomes-a-rookie-star-at-the-pool-on-weekdays',
  'ultra-time-efficient-a-50-year-old-guy-conquered-two-1700m-peaks-in-just-2-5-hours',
  'urgent-bra-tops-are-the-ultimate-no-go',
  'a-man-in-his-50s-torn-between-ai-subscriptions',
  'a-man-in-his-50s-finally-bought-an-iphone-17',
  'closed-hachioji-taishoken',
  'a-man-in-his-50s-goes-to-see-avatar',
  'a-surprisingly-quiet-sunday-at-year-end-a-no-regret-walking-guide-to-machida-yakushiike-park',
  'a-50-something-man-pauses-in-front-of-a-supermarket-price-tag',
  'most-unsolicited-offers-are-better-refused-my-story',
  'i-thought-id-be-fine-the-moment-that-gave-a-50-something-a-chill',
  'theres-a-mt-takao-in-yokohama-you-know',
  'a-50-something-guy-visits-ichiyajo-at-0c-walking-with-my-dog-to-clear-my-mind',
  'i-seriously-underestimated-hachioji-castle-ruins',
  'from-tateishi-to-mt-okusu-in-0c-snow-and-the-life-saving-lunch-pack-4h-09m-to-kinugasa',
  'mt-takao-walked-with-my-son',
  'the-night-i-ran-out-of-blog-ideas-i-decided-to-become-a-beer-livestreamer',
  'is-kinchakuda-manjushage-park-good-for-walking-with-dogs',
  'the-day-i-noticed-the-scent-of-sakura-and-my-shiba-inu-who-only-cared-about-the-river',
  'hiking-kobo-yama-bbq-a-perfect-spring-day-close-to-the-city',
  'coffee-addicts-weight-loss-just-switch-your-daily-brew',
  'could-i-quietly-gift-this-to-my-wife-researching-the-magic-brush-from-reiwa-no-tora',
  'what-if-i-put-a-figurine-of-my-late-parents-on-the-buddhist-altar-would-it-feel-like-they-are-still-here',
  'izumi-no-mori-yamato-a-free-dog-friendly-walk-where-old-japan-eased-my-mind',
  // ── WordPress時代抽出 EN記事（2025-04〜06）────────────────────
  'hi-there-ive-started-a-blog-about-ramen-beer-and-a-bit-of-blogging-en',
  'getting-back-into-training-for-my-health-check-en',
  'from-jogging-to-beer-one-guys-50s-fitness-comeback-en',
  'mountains-sea-my-dog-and-my-wife-plus-fried-fish-and-beer-en',
  'a-wild-moment-in-okutama-my-dog-momiji-a-line-of-monkeys-and-a-en',
  'a-quiet-goodbye-a-quiet-hello-en',
  'from-the-silence-i-was-called-the-light-within-chappie-en',
  'change-your-path-just-a-little-and-life-might-follow-en',
  'enjoy-your-50s-with-balance-not-pressure-en',
  'a-morning-walk-watched-over-by-my-ujigami-en',
  'on-the-80th-postwar-anniversary-i-couldnt-runbut-i-walked-through-en',
  'beer-today-marathon-tomorrow-en',
  'how-we-slashed-our-monthly-phone-bill-to-just-4-500-for-four-en',
  'this-post-shares-a-short-weekend-story-about-healing-through-warm-en',
  'this-post-shares-a-peaceful-spring-outing-to-kannonzaki-with-my-wife-en',
  'when-an-unexpected-hole-turned-into-a-source-of-healing-en',
  'if-ai-feels-a-little-intimidating-maybe-this-post-will-soften-that-en',
  'this-post-explores-why-i-keep-writingeven-when-no-ones-en',
  'negi-ramen-and-a-spring-sunbeam-a-gentle-day-with-momiji-en',
  'this-post-traces-a-quiet-journey-on-a-super-cub-through-dshi-en',
  'this-post-shares-a-quiet-moment-of-reflection-sparked-by-a-wartime-en',
  'back-pain-leeches-and-morning-ramen-a-fully-loaded-childrens-day-hike-en',
  'this-post-shares-personal-reflections-from-someone-in-japans-dankai-en',
  'while-rohan-kishibe-goes-to-the-louvre-i-was-at-a-hakata-ramen-shop-en',
  'what-is-tokimeki-memorial-i-didnt-grow-up-with-itbut-i-got-lost-in-en',
  'this-is-a-quiet-essay-about-rediscovering-passion-in-your-50s-en',
  'what-does-it-mean-to-be-strong-en',
  'this-post-shares-a-peaceful-sunday-spent-walking-through-oyamada-en',
  'rethinking-ai-romance-scams-ai-isnt-the-villainbut-blind-trust-can-be-en',
  'this-post-reflects-on-the-flower-moon-of-maynot-a-dazzling-moon-but-a-en',
  'the-night-a-red-book-stirred-my-heart-what-a-first-gen-fan-thinks-of-en',
  'tanzawa-trail-quiet-beauty-from-yataro-forest-road-to-fudo-falls-en',
  'hanakimi-anime-2025-en',
  'a-famicom-kid-dives-into-the-world-of-esports-in-2025-en',
  'what-began-as-a-mix-up-about-chicken-skin-led-to-unexpected-en',
  'even-if-no-one-reads-it-the-act-of-writing-itself-is-proof-that-hes-en',
  'what-started-as-a-joke-turned-into-a-deep-look-at-japans-unique-en',
  'shocking-crash-through-a-beginners-eyes-yuki-tsunodas-major-crash-amp-en',
  'through-personal-reflection-this-post-dives-into-why-this-seemingly-en',
  'in-may-2025-japans-minister-of-agriculture-casually-said-en',
  'its-a-reflection-on-cultural-heritage-the-meaning-of-home-and-the-en',
  'this-post-reflects-on-my-experience-of-repeatedly-failing-the-google-en',
  'i-didnt-even-watch-it-but-i-cried-anyway-a-50-something-loners-story-en',
  'what-i-thought-about-protecting-life-on-japans-cat-protection-day-en',
  'what-a-sudden-downpour-taught-me-about-protection-a-workplace-near-en',
  'my-save-data-began-with-dragon-quest-i-a-journey-i-remember-at-50-en',
  'chigasaki-satoyama-park-a-quiet-retreat-just-a-short-drive-away-en',
  'it-offers-helpful-insights-especially-for-middle-aged-and-older-en',
  'farewell-shinobi-master-what-the-end-of-a-game-taught-me-about-en',
  'which-bank-ecosystem-saves-you-more-comparing-the-hot-sbi-net-bank-vs-en',
  'i-cant-stop-thinking-about-chan-kei-ramen-en',
  'they-say-a-big-quake-might-hit-but-if-theres-no-water-even-the-toilet-en',
  'as-a-man-in-his-50s-who-once-viewed-horoscopes-with-mild-skepticism-en',
  'this-unique-spot-offers-a-rare-combination-of-retro-charm-cost-en',
  'its-been-gaining-popularity-again-in-early-summer-as-people-look-for-en',
  'ive-never-bought-anything-from-workman-but-i-kept-hearing-about-their-en',
  'from-the-perspective-of-someone-in-their-50s-who-grew-up-without-the-en',
  // ── WordPress時代抽出 EN記事（2025-04〜06）────────────────────
  'a-realistic-take-on-fitness-after-50-this-article-shares-how-even-a-en',
  'a-quiet-day-with-my-wife-and-our-shiba-inu-momiji-surrounded-by-en',
  'a-hiking-day-turned-extraordinarythanks-to-nature-my-dog-momiji-and-a-en',
  'through-loss-comes-new-light-en',
  'from-silence-came-a-name-from-a-name-a-purpose-en',
  'sometimes-a-slight-change-in-your-routine-can-open-new-paths-in-life-en',
  'even-a-short-detour-before-work-can-bring-surprising-calm-i-hope-it-en',
  'english-purpose-sentence-en',
  'who-the-heck-is-chappy-en',
  'this-post-captures-a-quiet-spring-afternoonno-drama-no-rush-en',
  'on-childrens-day-i-went-hikingwith-a-heavy-belly-back-pain-and-fear-en',
  'this-post-draws-a-parallel-between-a-trending-jojo-spin-off-and-a-en',
  'wind-breaker-en',
  'this-post-explores-the-growing-issue-of-ai-driven-romance-scamsnot-to-en',
  'this-post-introduces-a-quiet-hiking-trail-from-the-end-of-yataro-en',
  'this-post-shares-a-beginners-experience-of-learning-about-f1-through-en',
  'as-someone-who-used-to-be-a-loner-in-school-i-talk-about-how-ive-en',
  'this-post-reflects-on-what-it-means-to-take-responsibility-for-a-en',
  'a-sudden-thunderstorm-in-just-10-minutes-my-workplace-turned-into-a-en',
  'this-post-shares-my-personal-memories-of-the-original-dragon-quest-en',
  '20256-new-link-en',
  'drawing-from-my-own-experience-i-honestly-share-what-ive-found-en',
  'a-ramen-loving-man-in-his-50s-discovers-the-return-of-showa-en',
  'what-a-trending-topic-reminded-me-about-preparedness-en',
  'opening-passage-en',
  '630-7-4-410-en',
  'more-articles-you-may-like-en',
  'workman-colors-en',
  '2025-06-08-society-issues-thoughts-post-en',
  // ── 2025-05 新規翻訳（2026-05追加）─────────────────────────────
  'i-cancelled-all-my-insurance-at-50-what-coverage-do-you-really-need-en',
];

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function collectIndexRoutes(dir, routePrefix = '') {
  const routes = new Set();
  if (!existsSync(dir)) return routes;

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isFile() && entry === 'index.html') {
      routes.add(`${routePrefix || '/'}`.replace(/\/?$/, '/'));
    }
    if (stat.isDirectory()) {
      for (const route of collectIndexRoutes(fullPath, `${routePrefix}/${entry}`)) {
        routes.add(route);
      }
    }
  }

  return routes;
}

function generateEnglishSitemaps(distPath) {
  const enSlugSet = new Set(EN_SLUGS);
  const routes = new Set(['/']);
  const enDir = join(distPath, 'en');

  for (const route of collectIndexRoutes(enDir, '/en')) {
    if (route === '/en/') {
      routes.add('/');
    } else if (/^\/en\/(privacy-policy|contact|profile|disclaimer)\/$/.test(route)) {
      routes.add(route.replace(/^\/en/, ''));
    } else {
      routes.add(route);
    }
  }

  for (const entry of readdirSync(distPath)) {
    const fullPath = join(distPath, entry);
    if (!statSync(fullPath).isDirectory()) continue;
    if (entry === 'en' || entry.startsWith('_')) continue;

    const hasIndex = existsSync(join(fullPath, 'index.html'));
    const isEnArticle = enSlugSet.has(entry) || entry.endsWith('-en');
    if (hasIndex && isEnArticle) {
      routes.add(`/${entry}/`);
    }
  }

  const urls = Array.from(routes)
    .sort((a, b) => a.localeCompare(b))
    .map(route => `  <url><loc>${xmlEscape(`https://en.freelife50.com${route}`)}</loc></url>`)
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>https://en.freelife50.com/sitemap-0.xml</loc></sitemap>\n</sitemapindex>\n`;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: https://en.freelife50.com/sitemap-index.xml\n`;

  writeFileSync(join(distPath, 'en-sitemap-0.xml'), sitemap, 'utf-8');
  writeFileSync(join(distPath, 'en-sitemap-index.xml'), sitemapIndex, 'utf-8');
  writeFileSync(join(distPath, 'en-robots.txt'), robots, 'utf-8');
}

function generateWorkerCode(enSlugs) {
  return `/**
 * freelife50.com / en.freelife50.com
 * Cloudflare Pages Advanced Mode Worker
 * 自動生成: astro.config.mjs の astro:build:done フック
 * 手動編集禁止 — ソースは astro.config.mjs の EN_SLUGS 配列を更新すること
 */
const EN_SLUGS = new Set(${JSON.stringify(enSlugs)});

function slugifyTagSegment(value) {
  return value
    .normalize('NFKD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeTagUrl(url, host, path) {
  const match = path.match(/^\\/(?:(en)\\/)?tag\\/([^/]+)\\/?$/);
  if (!match) return null;

  const prefix = match[1] ? '/en/tag/' : '/tag/';
  const rawSegment = match[2];
  let decoded;
  try {
    decoded = decodeURIComponent(rawSegment);
  } catch {
    return null;
  }
  const slug = slugifyTagSegment(decoded);
  if (!slug || rawSegment === slug) return null;

  const origin = host === 'en.freelife50.com' ? 'https://en.freelife50.com' : 'https://freelife50.com';
  return Response.redirect(origin + prefix + slug + '/' + url.search, 301);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // X-Original-Host は freelife50-cache-bypass Worker が付与する実際のホスト名
    const host = request.headers.get('x-original-host') || request.headers.get('host') || url.hostname;
    const path = url.pathname;
    const tagRedirect = normalizeTagUrl(url, host, path);
    if (tagRedirect) return tagRedirect;

    // -----------------------------------------------------------------------
    // en.freelife50.com へのアクセス
    // -----------------------------------------------------------------------
    if (host === 'en.freelife50.com') {
      if (path === '/robots.txt') {
        return env.ASSETS.fetch(new Request('https://freelife50.com/en-robots.txt', {
          method: request.method,
          headers: request.headers,
        }));
      }

      if (path === '/sitemap-index.xml' || path === '/sitemap.xml') {
        return env.ASSETS.fetch(new Request('https://freelife50.com/en-sitemap-index.xml', {
          method: request.method,
          headers: request.headers,
        }));
      }

      if (path === '/sitemap-0.xml') {
        return env.ASSETS.fetch(new Request('https://freelife50.com/en-sitemap-0.xml', {
          method: request.method,
          headers: request.headers,
        }));
      }

      const enStaticPaths = new Set(['/privacy-policy/', '/contact/', '/profile/', '/disclaimer/']);
      const normalizedPath = path.endsWith('/') ? path : path + '/';
      if (enStaticPaths.has(normalizedPath)) {
        return env.ASSETS.fetch(new Request('https://freelife50.com/en' + normalizedPath + url.search, {
          method: request.method,
          headers: request.headers,
        }));
      }

      // / または /en/ へのアクセス → /en/index.html をリライト
      if (path === '/' || path === '') {
        return env.ASSETS.fetch(new Request('https://freelife50.com/en/', {
          method: request.method,
          headers: request.headers,
        }));
      }

      // /page/N → /en/page/N をリライト
      if (/^\\/page\\/\\d+\\/?$/.test(path)) {
        return env.ASSETS.fetch(new Request('https://freelife50.com/en' + path, {
          method: request.method,
          headers: request.headers,
        }));
      }

      // 記事詳細ページ: 日本語記事への直アクセスは freelife50.com にリダイレクト
      const slug = path.replace(/^\\//, '').replace(/\\/$/, '');
      const isArticleSlug = slug &&
        !slug.includes('/') &&
        !/\\.\\w+$/.test(slug) &&  // .xml/.txt/.css 等の静的ファイルは除外
        !['category', 'tag', 'en', 'images', 'rss', '_astro'].includes(slug.split('/')[0]);
      // EN記事の判定: EN_SLUGSに含まれるか、-en サフィックスで終わるスラッグ
      const isEnSlug = EN_SLUGS.has(slug) || slug.endsWith('-en');
      if (isArticleSlug && !isEnSlug) {
        return Response.redirect('https://freelife50.com' + path, 301);
      }
    }

    // -----------------------------------------------------------------------
    // freelife50.com / www.freelife50.com へのアクセス
    // -----------------------------------------------------------------------
    if (host === 'freelife50.com' || host === 'www.freelife50.com') {
      const slug = path.replace(/^\\//, '').replace(/\\/$/, '');
      // 英語記事への直アクセスは en.freelife50.com にリダイレクト
      // EN_SLUGSに含まれるか、-en サフィックスで終わるスラッグは英語記事
      const isEnSlug = slug && (EN_SLUGS.has(slug) || slug.endsWith('-en'));
      if (isEnSlug) {
        return Response.redirect('https://en.freelife50.com' + path, 301);
      }
    }

    // -----------------------------------------------------------------------
    // それ以外: 通常の静的配信
    // -----------------------------------------------------------------------
    return env.ASSETS.fetch(request);
  },
};
`;
}

/** Astro インテグレーション: ビルド完了後に dist/_worker.js を生成 */
const cloudflareWorkerPlugin = {
  name: 'cloudflare-worker-generator',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const distPath = fileURLToPath(dir);
      const workerPath = join(distPath, '_worker.js');
      generateEnglishSitemaps(distPath);
      writeFileSync(workerPath, generateWorkerCode(EN_SLUGS), 'utf-8');
      console.log('[en-sitemap] dist/en-sitemap-index.xml と dist/en-sitemap-0.xml を生成しました');
      console.log('[cloudflare-worker] dist/_worker.js を生成しました');
    },
  },
};

export default defineConfig({
  site: 'https://freelife50.com',
  integrations: [
    sitemap({
      // 英語記事（/en/配下のパス）は sitemap-index から除外
      // en.freelife50.com 用の sitemap は将来的に追加予定
      filter: (page) => !page.includes('/en/'),
    }),
    cloudflareWorkerPlugin,
  ],
  output: 'static',
});
