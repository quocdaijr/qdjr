// Posts store using Pinia with TypeScript
import type { Post, ApiParams } from '~/plugins/api'

interface PostsState {
  count: number
  posts: Post[]
  postsMore: Post[]
  post: Post | null
  error: {
    message: string
    statusCode: number
  } | null
}

export const usePostsStore = defineStore('posts', {
  state: (): PostsState => ({
    count: 0,
    posts: [],
    postsMore: [],
    post: null,
    error: null
  }),

  getters: {
    allPosts: (state) => [...state.posts, ...state.postsMore],
    hasMorePosts: (state) => state.count > 0,
    currentPost: (state) => state.post,
    hasError: (state) => !!state.error
  },

  actions: {
    setPosts(payload: { data: Post[], total?: number }) {
      this.posts = payload.data || []
      this.count = (payload.total || 0) - this.posts.length || 0
      this.postsMore = []
      this.error = null
    },

    setPostsFromLoadMore(payload: { data: Post[] }) {
      this.postsMore = [...this.postsMore, ...(payload.data || [])]
      this.count -= (payload.data || []).length || 0
      this.error = null
    },

    setPost(payload: Post | null) {
      this.post = payload
      this.error = null
    },

    setError(payload: { message: string, statusCode: number }) {
      this.error = payload
    },

    async getPosts(params: ApiParams & { isLoadMore?: boolean } = {}) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.getPosts(params)
        
        if (params.isLoadMore) {
          this.setPostsFromLoadMore(response.data)
        } else {
          this.setPosts(response.data)
        }
      } catch (error: any) {
        this.setPosts({ data: [] })
        this.setError({
          message: error?.data?.message || 'Unknown Error',
          statusCode: error?.status || 500
        })
      }
    },

    async getPost(slug: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.getPost(slug)
        this.setPost(response.data)
      } catch (error: any) {
        this.setPost(null)
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
