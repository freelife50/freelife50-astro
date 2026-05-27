import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export const qualityRedirectSlugs = [
  '__trashed',
  '__trashed-2',
  '__trashed-3',
  'タイトル',
  'タイトル-50代ビール好き-健康管理は無理し',
  'タイトル-激しい雷雨の日に-僕が-守ること',
  'タイトル案-ランゴ兄さんって誰やねん',
];

const blockedSlugs = new Set(qualityRedirectSlugs);
const lowQualityTitlePrefixes = [
  'This post ',
  'It offers ',
  'As a man ',
  'Through personal ',
  'They say ',
];

export function isPublicPost(post: BlogPost): boolean {
  const slug = post.data.slug?.trim();
  const title = post.data.title?.trim();

  if (!slug || !title) return false;
  if (slug.startsWith('__')) return false;
  if (blockedSlugs.has(slug)) return false;
  if (title === 'タイトル') return false;
  if (lowQualityTitlePrefixes.some(prefix => title.startsWith(prefix))) return false;

  return true;
}

export function getPublicPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter(isPublicPost);
}

export function sortByNewest(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

export function languageMatches(post: BlogPost, lang: 'ja' | 'en'): boolean {
  return lang === 'en' ? post.data.lang === 'en' : post.data.lang !== 'en';
}
