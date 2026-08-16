// Categories store using Pinia with TypeScript
import type { Category, ApiParams } from '~/plugins/api'

interface CategoriesState {
  count: number
  categories: Category[]
  categoriesMore: Category[]
  category: Category | null
  error: {
    message: string
    statusCode: number
  } | null
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    count: 0,
    categories: [],
    categoriesMore: [],
    category: null,
    error: null
  }),

  getters: {
    allCategories: (state) => [...state.categories, ...state.categoriesMore],
    hasMoreCategories: (state) => state.count > 0,
    currentCategory: (state) => state.category,
    hasError: (state) => !!state.error
  },

  actions: {
    setCategories(payload: { data: Category[], total?: number }) {
      this.categories = payload.data || []
      this.count = (payload.total || 0) - this.categories.length || 0
      this.categoriesMore = []
      this.error = null
    },

    setCategoriesFromLoadMore(payload: { data: Category[] }) {
      this.categoriesMore = [...this.categoriesMore, ...(payload.data || [])]
      this.count -= (payload.data || []).length || 0
      this.error = null
    },

    setCategory(payload: Category | null) {
      this.category = payload
      this.error = null
    },

    setError(payload: { message: string, statusCode: number }) {
      this.error = payload
    },

    async getCategories(params: ApiParams & { isLoadMore?: boolean } = {}) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.getCategories(params)
        
        if (params.isLoadMore) {
          this.setCategoriesFromLoadMore(response.data)
        } else {
          this.setCategories(response.data)
        }
      } catch (error: any) {
        this.setCategories({ data: [] })
        this.setError({
          message: error?.data?.message || 'Unknown Error',
          statusCode: error?.status || 500
        })
      }
    },

    async getCategory(slug: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.getCategory(slug)
        this.setCategory(response.data)
      } catch (error: any) {
        this.setCategory(null)
        this.setError({
          message: error?.data?.message || 'Unknown Error',
          statusCode: error?.status || 500
        })
      }
    },

    clearError() {
      this.error = null
    }
  }
})
