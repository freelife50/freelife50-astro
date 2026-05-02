// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFileSync } from 'fs';
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
  'komachi-shrine-takamatsu-hiking-en',
  'ninomiya-sodegaura-hiking-en',
  'yokohama-kodomo-shizen-park-firefly-en',
  'momiji-rabies-vaccine-en',
  'sagami-odako-festival-2026-en',
  'hakone-museum-of-art-gardener-en',
  'grands-grain-free-dog-food-review-shiba-inu-en',
  'iijmio-1year-report-en',
];

function generateWorkerCode(enSlugs) {
  return `/**
 * freelife50.com / en.freelife50.com
 * Cloudflare Pages Advanced Mode Worker
 * 自動生成: astro.config.mjs の astro:build:done フック
 * 手動編集禁止 — ソースは astro.config.mjs の EN_SLUGS 配列を更新すること
 */
const EN_SLUGS = new Set(${JSON.stringify(enSlugs)});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const path = url.pathname;

    // -----------------------------------------------------------------------
    // en.freelife50.com へのアクセス
    // -----------------------------------------------------------------------
    if (host === 'en.freelife50.com') {
      // / または /en/ へのアクセス → /en/index.html をリライト
      if (path === '/' || path === '') {
        const rewriteUrl = new URL('/en/', url);
        rewriteUrl.hostname = url.hostname; // ホスト名は維持
        return env.ASSETS.fetch(new Request(rewriteUrl.toString(), request));
      }

      // /page/N → /en/page/N をリライト
      if (/^\\/page\\/\\d+\\/?$/.test(path)) {
        const rewriteUrl = new URL('/en' + path, url);
        return env.ASSETS.fetch(new Request(rewriteUrl.toString(), request));
      }

      // 記事詳細ページ: 日本語記事への直アクセスは freelife50.com にリダイレクト
      const slug = path.replace(/^\\//, '').replace(/\\/$/, '');
      const isArticleSlug = slug &&
        !slug.includes('/') &&
        !['category', 'tag', 'en', 'images', 'rss'].includes(slug.split('/')[0]);
      if (isArticleSlug && !EN_SLUGS.has(slug)) {
        return Response.redirect('https://freelife50.com' + path, 301);
      }
    }

    // -----------------------------------------------------------------------
    // freelife50.com / www.freelife50.com へのアクセス
    // -----------------------------------------------------------------------
    if (host === 'freelife50.com' || host === 'www.freelife50.com') {
      const slug = path.replace(/^\\//, '').replace(/\\/$/, '');
      // 英語記事への直アクセスは en.freelife50.com にリダイレクト
      if (slug && EN_SLUGS.has(slug)) {
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
      writeFileSync(workerPath, generateWorkerCode(EN_SLUGS), 'utf-8');
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
