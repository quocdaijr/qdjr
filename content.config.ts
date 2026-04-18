import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
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
    })
  }
})
