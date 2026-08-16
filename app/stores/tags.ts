// Tags store using Pinia with TypeScript
import type { Tag, ApiParams } from '~/plugins/api'

interface TagsState {
  count: number
  tags: Tag[]
  tagsMore: Tag[]
  tag: Tag | null
  error: {
    message: string
    statusCode: number
  } | null
}

export const useTagsStore = defineStore('tags', {
  state: (): TagsState => ({
    count: 0,
    tags: [],
    tagsMore: [],
    tag: null,
    error: null
  }),

  getters: {
    allTags: (state) => [...state.tags, ...state.tagsMore],
    hasMoreTags: (state) => state.count > 0,
    currentTag: (state) => state.tag,
    hasError: (state) => !!state.error
  },

  actions: {
    setTags(payload: { data: Tag[], total?: number }) {
      this.tags = payload.data || []
      this.count = (payload.total || 0) - this.tags.length || 0
      this.tagsMore = []
      this.error = null
    },

    setTagsFromLoadMore(payload: { data: Tag[] }) {
      this.tagsMore = [...this.tagsMore, ...(payload.data || [])]
      this.count -= (payload.data || []).length || 0
      this.error = null
    },

    setTag(payload: Tag | null) {
      this.tag = payload
      this.error = null
    },

    setError(payload: { message: string, statusCode: number }) {
      this.error = payload
    },

    async getTags(params: ApiParams & { isLoadMore?: boolean } = {}) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.getTags(params)
        
        if (params.isLoadMore) {
          this.setTagsFromLoadMore(response.data)
        } else {
          this.setTags(response.data)
        }
      } catch (error: any) {
        this.setTags({ data: [] })
        this.setError({
          message: error?.data?.message || 'Unknown Error',
          statusCode: error?.status || 500
        })
      }
    },

    async getTag(slug: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.getTag(slug)
        this.setTag(response.data)
      } catch (error: any) {
        this.setTag(null)
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
