import type {ApiPost} from '~/plugins/api'
import {renderMarkdown} from '~/utils/markdown'

/** What the blog pages render. Posts are written in Vietnamese; the English site shows them as-is and says so. */
export interface BlogPost {
  path: string
  slug: string
  title: string
  description: string
  publishedAt: string | null
  updatedAt: string
  thumbnail?: string
  cover?: string
  category?: string
  tags: string[]
  html?: string
  originalOnly?: boolean
}

export function toBlogPost(post: ApiPost, locale: string, withBody = false): BlogPost {
  return {
    path: `/blog/${post.slug}`,
    slug: post.slug,
    title: post.title,
    description: post.excerpt ?? '',
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    thumbnail: post.thumbnail?.url,
    cover: post.thumbnail?.url,
    category: post.category?.slug,
    tags: post.tags.map((tag) => tag.slug),
    html: withBody ? renderMarkdown(post.content) : undefined,
    originalOnly: locale !== 'vi' ? true : undefined
  }
}

/** Published posts, newest first, optionally narrowed by category/tag slug. Empty when the API is unreachable. */
export async function fetchBlogPosts(locale: string, filter: {category?: string; tag?: string} = {}): Promise<BlogPost[]> {
  const {$api} = useNuxtApp()
  try {
    const {posts} = await $api.listPosts({...filter, perPage: 100})
    return posts.map((post) => toBlogPost(post, locale))
  } catch (error) {
    console.error('[blog] list failed:', (error as Error).message)
    return []
  }
}

/** One post with its rendered body; null when it does not exist (404). Other failures propagate to the Nuxt error page. */
export async function fetchBlogPost(slug: string, locale: string): Promise<BlogPost | null> {
  const {$api} = useNuxtApp()
  const post = await $api.getPost(slug)
  return post ? toBlogPost(post, locale, true) : null
}
