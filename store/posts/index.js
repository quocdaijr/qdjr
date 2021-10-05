export const state = () => ({
  count: 0,
  posts: [],
  postsMore: [],
  post: null,
  errors: null
})

export const mutations = {
  setPosts(state, payload) {
    state.posts = payload.data || []
    state.count = (payload.total || 0) - state.posts.length
    state.postsMore = []
    state.errors = null
  },
  setPostsFromLoadMore(state, payload) {
    state.postsMore = [...state.postsMore, ...(payload.data || [])]
    state.count -= (payload.data || []).length
    state.errors = null
  },
  setPost(state, payload) {
    state.post = payload
    state.errors = null
  },
  setErrors(state, payload) {
    state.errors = payload
  }
}

export const actions = {
  async getPosts({commit}, params = {}) {
    await this.$axios.$get("/posts", {
      params: {
        txt: params.txt || "",
        page: params.page || 1,
        perPage: params.perPage || 2,
        tag: params.tag || "",
        category: params.category || "",
      }
    }).then((res) => {
      if (params.isLoadMore)
        commit("setPostsFromLoadMore", res)
      else
        commit("setPosts", res)
    }).catch((err) => {
      commit("setErrors", err.data || {'message': 'Unknown Error', 'statusCode': 500})

    })
  },
  async setPost({commit}, {param}) {
    await this.$axios.$get("/post/" + param)
      .then((res) => {
        commit("setPost", res)
      })
      .catch(err => {
        commit("setErrors", err.data || {'message': 'Unknown Error', 'statusCode': 500})
      })
  },
}
