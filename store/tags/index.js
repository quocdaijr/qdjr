export const state = () => ({
  count: 0,
  tags: [],
  tagsMore: [],
  tag: null,
  error: null
})

export const mutations = {
  setTags(state, payload) {
    state.tags = payload.data || []
    state.count = (payload.total || 0) - state.tags.length || 0
    state.tagsMore = []
    state.error = null
  },
  setTagsFromLoadMore(state, payload) {
    state.tagsMore = [...state.tagsMore, ...(payload.data || [])]
    state.count -= (payload.data || []).length || 0
    state.error = null
  },
  setTag(state, payload) {
    state.tag = payload || null
    state.error = null
  },
  setError(state, payload) {
    state.error = payload
  }
}

export const actions = {
  async getTags({commit}, params = {}) {
    await this.$axios.$get("/tags", {
      params: {
        page: params.page || 1,
        perPage: params.perPage || 10,
      }
    }).then((res) => {
      if (params.isLoadMore)
        commit("setTagsFromLoadMore", res)
      else
        commit("setTags", res)
    }).catch((err) => {
      commit("setTags", {})
      commit("setError", {
        message: err.response.data.message || 'Unknown Error',
        statusCode: err.response.status || 500
      })
    })
  },
  async getTag({commit}, {param}) {
    await this.$axios.$get("/tag/" + param)
      .then((res) => {
        commit("setTag", res)
      })
      .catch(err => {
        commit("setTag", null)
        commit("setError", {
          message: err.response.data.message || 'Unknown Error',
          statusCode: err.response.status || 500
        })
      })
  },
}
