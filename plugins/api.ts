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
  updated_at: string
  created_at: string
}

export interface Tag {
  id: number
  slug: string
  name: string
  description?: string
  updated_at: string
  created_at: string
}

export interface Post {
  id: number
  slug: string
  title: string
  content?: string
  excerpt?: string
  published_at: string
  thumbnail: string
  location?: string
  category?: Category
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

  // API functions using $fetch
  const api = {
    // Category APIs
    getCategories: async (params: ApiParams = {}): Promise<ApiResponse<Category>> => {
      return await $fetch(`${API_URL}/categories`, {
        params: {
          page: params.page || 1,
          perPage: params.perPage || 10
        }
      })
    },

    getCategory: async (slug: string): Promise<{ data: Category }> => {
      return await $fetch(`${API_URL}/category/${slug}`)
    },

    // Tag APIs
    getTags: async (params: ApiParams = {}): Promise<ApiResponse<Tag>> => {
      return await $fetch(`${API_URL}/tags`, {
        params: {
          page: params.page || 1,
          perPage: params.perPage || 10
        }
      })
    },

    getTag: async (slug: string): Promise<{ data: Tag }> => {
      return await $fetch(`${API_URL}/tag/${slug}`)
    },

    // Post APIs
    getPosts: async (params: ApiParams = {}): Promise<ApiResponse<Post>> => {
      return await $fetch(`${API_URL}/posts`, {
        params: {
          txt: params.txt || '',
          page: params.page || 1,
          perPage: params.perPage || 5,
          tag: params.tag || '',
          category: params.category || ''
        }
      })
    },

    getPost: async (slug: string): Promise<{ data: Post }> => {
      return await $fetch(`${API_URL}/post/${slug}`)
    }
  }

  // Provide the API to the app
  return {
    provide: {
      api
    }
  }
})
