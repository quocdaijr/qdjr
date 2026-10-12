// $api: the qdjr-admin public API (apps/api, /v1/*). Server- and client-side.

export interface ApiCategory {
  id: string
  slug: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type ApiTag = ApiCategory

export interface ApiPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string // markdown
  published_at: string | null
  thumbnail: {url: string; alt: string} | null
  location: string | null
  category: Pick<ApiCategory, 'id' | 'slug' | 'name'> | null
  tags: Array<Pick<ApiTag, 'id' | 'slug' | 'name'>>
  created_at: string
  updated_at: string
}

export interface ApiProfile {
  id: number
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  tagline: string | null
  social_links: Record<string, string>
  location: string | null
  email: string | null
  content: Record<string, unknown>
  updated_at: string
}

export interface ApiSiteSettings {
  id: number
  site_title: string
  site_description: string | null
  footer_text: string | null
  contact_email: string | null
  social_links: Record<string, string>
  updated_at: string
}

export interface PostFilter {
  page?: number
  perPage?: number
  category?: string
  tag?: string
  q?: string
}

interface Envelope<T> {
  data: T | null
  meta?: {page: number; perPage: number; total: number}
  error: {code: string; message: string} | null
}

const isNotFound = (error: unknown) => {
  const e = error as {status?: number; statusCode?: number} | null
  return e?.status === 404 || e?.statusCode === 404
}

export default defineNuxtPlugin(() => {
  const base = `${String(useRuntimeConfig().public.apiUrl).replace(/\/+$/, '')}/v1`
  // Fail fast: pages fall back (empty list, bundled profile) rather than hang
  // a Netlify function on a sleeping API.
  const opts = {timeout: 8000, retry: 0 as const}

  const get = <T>(path: string, query?: Record<string, string | number | undefined>) =>
    $fetch<Envelope<T>>(`${base}${path}`, {...opts, query})

  const api = {
    async listPosts(filter: PostFilter = {}): Promise<{posts: ApiPost[]; total: number}> {
      const res = await get<ApiPost[]>('/posts', {
        page: filter.page ?? 1,
        perPage: filter.perPage ?? 50,
        category: filter.category || undefined,
        tag: filter.tag || undefined,
        q: filter.q || undefined
      })
      return {posts: res.data ?? [], total: res.meta?.total ?? 0}
    },

    async getPost(slug: string): Promise<ApiPost | null> {
      try {
        return (await get<ApiPost>(`/posts/${encodeURIComponent(slug)}`)).data
      } catch (error) {
        if (isNotFound(error)) return null
        throw error
      }
    },

    async listCategories(): Promise<ApiCategory[]> {
      return (await get<ApiCategory[]>('/categories')).data ?? []
    },

    async listTags(): Promise<ApiTag[]> {
      return (await get<ApiTag[]>('/tags')).data ?? []
    },

    async getProfile(): Promise<ApiProfile | null> {
      return (await get<ApiProfile>('/profile')).data
    },

    async getSiteSettings(): Promise<ApiSiteSettings | null> {
      return (await get<ApiSiteSettings>('/site-settings')).data
    }
  }

  return {provide: {api}}
})
