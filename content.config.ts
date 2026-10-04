import {defineCollection, defineContentConfig, z} from '@nuxt/content'

const post = z.object({
  title: z.string(),
  description: z.string().default(''),
  publishedAt: z.date(),
  updatedAt: z.date().optional(),
  cover: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  author: z.string().optional()
})

export default defineContentConfig({
  collections: {
    // Originals, written in Vietnamese. Paths: /blog/<slug>.
    blog: defineCollection({type: 'page', source: 'blog/**/*.md', schema: post}),

    // English machine translations written by `npm run translate:posts`.
    // `prefix` gives each one the same path as its original, so one path
    // finds a post in either collection.
    blog_en: defineCollection({
      type: 'page',
      source: {include: 'en/blog/**/*.md', prefix: '/blog'},
      schema: post.extend({
        machineTranslated: z.boolean().default(true),
        translatedFrom: z.string().default('vi'),
        translationProvider: z.string().default('google-translate'),
        sourceHash: z.string().default(''),
        translatedAt: z.date().optional()
      })
    })
  }
})
