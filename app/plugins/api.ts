// API Plugin for Nuxt 3 with TypeScript
// Replaces axios with native $fetch

// Type definitions
export interface ApiResponse<T> {
  status: number
  data: {
    data: T[]
    total?: number
    current_page?: number
    last_page?: number
    per_page?: number
  }
}

export interface Category {
  id: number
  slug: string
  name: string
  description?: string
  // Read by HeaderContent in the legacy category/tag pages.
  cover?: string
  updated_at: string
  created_at: string
}

export interface Tag {
  id: number
  slug: string
  name: string
  description?: string
  cover?: string
  updated_at: string
  created_at: string
}

export interface Post {
  id: number
  slug: string
  title: string
  content?: string
  excerpt?: string
  description?: string
  published_at: string
  thumbnail: string
  cover?: string
  author?: string
  location?: string
  category?: Category
  // The API shape is unverifiable while the backend is down: post/Detail.vue
  // reads `categories[0]` while this interface declared only `category`. Both
  // are optional here and the component normalises them.
  categories?: Category[]
  tags?: Tag[]
  created_at: string
  updated_at: string
}

export interface ApiParams {
  page?: number
  perPage?: number
  txt?: string
  tag?: string
  category?: string
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const API_URL = config.public.apiUrl

  // The legacy backend (api.qdjr.me) no longer resolves. When apiUrl is empty
  // every call short-circuits to an empty result, so the legacy pages render
  // their offline state instantly and issue no network requests at all.
  const enabled = Boolean(API_URL)

  // Fail fast rather than hanging on a dead host, and never retry a DNS failure.
  const opts = {timeout: 5000, retry: 0 as const}

  const emptyList = <T>(): ApiResponse<T> => ({status: 0, data: {data: [], total: 0}})

  // API functions using $fetch
  const api = {
    // Whether a backend is configured at all. Components read this to tell
    // "archive offline" apart from "resource not found".
    enabled,

    // Category APIs
    getCategories: async (params: ApiParams = {}): Promise<ApiResponse<Category>> => {
      if (!enabled) return emptyList<Category>()
      return await $fetch(`${API_URL}/categories`, {
        ...opts,
        // `params` is a legacy alias for `query`; use the canonical name.
        query: {
          page: params.page || 1,
          perPage: params.perPage || 10
        }
      })
    },

    getCategory: async (slug: string): Promise<{ data: Category | null }> => {
      if (!enabled) return {data: null}
      return await $fetch(`${API_URL}/category/${slug}`, opts)
    },

    // Tag APIs
    getTags: async (params: ApiParams = {}): Promise<ApiResponse<Tag>> => {
      if (!enabled) return emptyList<Tag>()
      return await $fetch(`${API_URL}/tags`, {
        ...opts,
        query: {
          page: params.page || 1,
          perPage: params.perPage || 10
        }
      })
    },

    getTag: async (slug: string): Promise<{ data: Tag | null }> => {
      if (!enabled) return {data: null}
      return await $fetch(`${API_URL}/tag/${slug}`, opts)
    },

    // Post APIs
    getPosts: async (params: ApiParams = {}): Promise<ApiResponse<Post>> => {
      if (!enabled) return emptyList<Post>()
      return await $fetch(`${API_URL}/posts`, {
        ...opts,
        query: {
          txt: params.txt || '',
          page: params.page || 1,
          perPage: params.perPage || 5,
          tag: params.tag || '',
          category: params.category || ''
        }
      })
    },

    getPost: async (slug: string): Promise<{ data: Post | null }> => {
      if (!enabled) return {data: null}
      return await $fetch(`${API_URL}/post/${slug}`, opts)
    }
  }

  // Provide the API to the app
  return {
    provide: {
      api
    }
  }
})
