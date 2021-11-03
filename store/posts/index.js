import {getPosts, getPost} from "~/plugins/api"

export const state = () => ({
  count: 0,
  posts: [],
  postsMore: [],
  post: null,
  error: null
})

export const mutations = {
  setPosts(state, payload) {
    state.posts = payload.data || []
    state.count = (payload.total || 0) - state.posts.length || 0
    state.postsMore = []
    state.error = null
  },
  setPostsFromLoadMore(state, payload) {
    state.postsMore = [...state.postsMore, ...(payload.data || [])]
    state.count -= (payload.data || []).length || 0
    state.error = null
  },
  setPost(state, payload) {
    state.post = payload || null
    state.error = null
  },
  setError(state, payload) {
    state.error = payload
  }
}

export const actions = {
  async getPosts({commit}, params = {}) {
    await getPosts({
      params: {
        txt: params.txt || "",
        page: params.page || 1,
        perPage: params.perPage || 2,
        tag: params.tag || "",
        category: params.category || "",
      }
    }).then(({data}) => {
      if (params.isLoadMore)
        commit("setPostsFromLoadMore", data)
      else
        commit("setPosts", data)
    }).catch(err => {
      commit("setPosts", {})
      commit("setError", {
        message: err.response.data.message || 'Unknown Error',
        statusCode: err.response.status || 500
      })
    })
  },
  async getPost({commit}, {param}) {
    await getPost(param)
      .then(({data}) => {
        commit("setPost", data)
      }).catch(err => {
        commit("setPost", null)
        commit("setError", {
          message: err.response.data.message || 'Unknown Error',
          statusCode: err.response.status || 500
        })
      })
  },
}
