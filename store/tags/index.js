import {getTags, getTag} from "~/plugins/api"

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
    await getTags(params).then(({data}) => {
      if (params.isLoadMore)
        commit("setTagsFromLoadMore", data)
      else
        commit("setTags", data)
    }).catch((err) => {
      commit("setTags", {})
      commit("setError", {
        message: err.response.data.message || 'Unknown Error',
        statusCode: err.response.status || 500
      })
    })
  },
  async getTag({commit}, {param}) {
    await getTag(param).then(({data}) => {
      commit("setTag", data)
    }).catch(err => {
      commit("setTag", null)
      commit("setError", {
        message: err.response.data.message || 'Unknown Error',
        statusCode: err.response.status || 500
      })
    })
  },
}
