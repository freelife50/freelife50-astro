import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    slug: z.string(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    eyecatch: z.string().optional(),
    lang: z.enum(['ja', 'en']).default('ja'),
    excerpt: z.string().optional(),
  }),
});

export const collections = { blog };
