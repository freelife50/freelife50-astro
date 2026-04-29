#!/usr/bin/env node
/**
 * Markdownファイル内のアイキャッチ画像URLをローカルパスに一括置換
 * https://freelife50.com/wp-content/uploads/... → /images/wp-content/uploads/...
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '../src/content/blog');
const OLD_BASE = 'https://freelife50.com';
const NEW_BASE = '/images';

const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
let fixed = 0;
let urlsReplaced = 0;

for (const file of files) {
  const path = join(BLOG_DIR, file);
  let content = readFileSync(path, 'utf8');
  const original = content;

  // 1) フロントマターの eyecatch: "https://freelife50.com/wp-content/..."
  content = content.replace(
    /eyecatch: "(https:\/\/freelife50\.com)(\/wp-content\/uploads\/[^"]+)"/g,
    (_, _base, path) => `eyecatch: "${NEW_BASE}${path}"`
  );

  // 2) HTML本文内の src="https://freelife50.com/wp-content/..."
  content = content.replace(
    /src="https:\/\/freelife50\.com(\/wp-content\/uploads\/[^"]+)"/g,
    (_, path) => `src="${NEW_BASE}${path}"`
  );

  // 3) href="https://freelife50.com/wp-content/..." (画像リンク)
  content = content.replace(
    /href="https:\/\/freelife50\.com(\/wp-content\/uploads\/[^"]+)"/g,
    (_, path) => `href="${NEW_BASE}${path}"`
  );

  // 4) srcset の URL
  content = content.replace(
    /https:\/\/freelife50\.com(\/wp-content\/uploads\/[^\s,"']+)/g,
    (_, path) => `${NEW_BASE}${path}`
  );

  if (content !== original) {
    writeFileSync(path, content, 'utf8');
    fixed++;
    const count = (content.match(/\/images\/wp-content/g) || []).length;
    urlsReplaced += count;
  }
}

console.log(`修正ファイル: ${fixed}件`);
console.log(`置換URL数: ${urlsReplaced}件`);
