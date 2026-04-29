#!/usr/bin/env node
/**
 * WordPress XML → Astro Markdown 変換スクリプト
 * 使用: node scripts/import-wp.js <xmlファイルパス>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../src/content/blog');

// ---------- XML パース ----------
function parseXml(xmlStr) {
  // シンプルな正規表現ベースのパーサー（外部依存なし）
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xmlStr)) !== null) {
    items.push(m[1]);
  }
  return items;
}

function getTag(xml, tag, ns = '') {
  const full = ns ? `${ns}:${tag}` : tag;
  const re = new RegExp(`<${full}(?:[^>]*)><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${full}>|<${full}(?:[^>]*)>([^<]*)<\\/${full}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return (m[1] !== undefined ? m[1] : m[2] || '').trim();
}

function getTags(xml, tag, attr, attrVal) {
  const results = [];
  const re = new RegExp(`<category[^>]*domain="${attr}"[^>]*><![CDATA\\[(.*?)\\]\\]><\/category>`, 'g');
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].trim());
  }
  return results;
}

function getCategoriesByDomain(xml, domain) {
  const results = [];
  // nicenameを取得する
  const re = new RegExp(`<category[^>]*domain="${domain}"[^>]*nicename="([^"]*)"[^>]*>`, 'g');
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].trim());
  }
  return results;
}

// ---------- HTML → テキスト（excerpt用） ----------
function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------- フロントマター エスケープ ----------
function yamlStr(s) {
  if (!s) return '""';
  const escaped = s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

// ---------- スラッグ正規化 ----------
function normalizeSlug(raw) {
  try {
    return decodeURIComponent(raw)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\-_]/gu, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  } catch {
    return raw.replace(/[^\w\-]/g, '-');
  }
}

// ---------- メイン ----------
const xmlPath = process.argv[2];
if (!xmlPath) {
  console.error('使用: node scripts/import-wp.js <xmlファイルパス>');
  process.exit(1);
}

console.log(`読み込み: ${xmlPath}`);
let xmlStr = readFileSync(xmlPath, 'utf8');
// 制御文字除去
xmlStr = xmlStr.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');

const rawItems = parseXml(xmlStr);
console.log(`アイテム総数: ${rawItems.length}`);

mkdirSync(OUTPUT_DIR, { recursive: true });

let count = 0;
let skipped = 0;
const slugSet = new Set();

for (const item of rawItems) {
  const postType = getTag(item, 'post_type', 'wp');
  const status = getTag(item, 'status', 'wp');

  if (postType !== 'post' || status !== 'publish') {
    skipped++;
    continue;
  }

  const title = getTag(item, 'title');
  const rawSlug = getTag(item, 'post_name', 'wp');
  const pubDate = getTag(item, 'post_date', 'wp');
  const content = getTag(item, 'encoded', 'content');
  const categories = getCategoriesByDomain(item, 'category');
  const tags = getCategoriesByDomain(item, 'post_tag');

  // アイキャッチ画像URLを postmeta から取得（メディアURL直接保持している場合）
  const thumbnailUrlMatch = item.match(/<wp:meta_key><!\[CDATA\[_thumbnail_url\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]>/);
  const eyecatch = thumbnailUrlMatch ? thumbnailUrlMatch[1] : '';

  // スラッグ決定
  let slug = normalizeSlug(rawSlug) || normalizeSlug(title);
  if (!slug) slug = `post-${getTag(item, 'post_id', 'wp')}`;

  // 重複回避
  let finalSlug = slug;
  let dup = 1;
  while (slugSet.has(finalSlug)) {
    finalSlug = `${slug}-${dup++}`;
  }
  slugSet.add(finalSlug);

  // 日付
  const dateStr = pubDate ? pubDate.split(' ')[0] : '2020-01-01';

  // excerpt
  const excerptRaw = getTag(item, 'encoded', 'excerpt') || htmlToText(content).slice(0, 120);
  const excerpt = htmlToText(excerptRaw).slice(0, 150);

  // 言語判定
  const lang = (finalSlug.endsWith('-en') || finalSlug.includes('-en-')) ? 'en' : 'ja';

  // Markdownファイル生成
  const frontmatter = [
    '---',
    `title: ${yamlStr(title)}`,
    `date: "${dateStr}"`,
    `slug: "${finalSlug}"`,
    `categories: [${categories.map(c => `"${c}"`).join(', ')}]`,
    `tags: [${tags.slice(0, 20).map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]`,
    eyecatch ? `eyecatch: "${eyecatch}"` : '',
    `lang: "${lang}"`,
    excerpt ? `excerpt: ${yamlStr(excerpt)}` : '',
    '---',
  ].filter(Boolean).join('\n');

  const mdContent = `${frontmatter}\n\n${content}\n`;

  const filename = `${dateStr}-${finalSlug}.md`;
  writeFileSync(join(OUTPUT_DIR, filename), mdContent, 'utf8');
  count++;

  if (count % 50 === 0) console.log(`  変換済み: ${count}件...`);
}

console.log(`\n完了: ${count}件 変換 / ${skipped}件 スキップ`);
console.log(`出力先: ${OUTPUT_DIR}`);
