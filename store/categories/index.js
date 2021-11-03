import {getCategories, getCategory} from "~/plugins/api"

export const state = () => ({
  count: 0,
  categories: [],
  categoriesMore: [],
  category: null,
  error: null
})

export const mutations = {
  setCategories(state, payload) {
    state.categories = payload.data || []
    state.count = (payload.total || 0) - state.categories.length || 0
    state.categoriesMore = []
    state.error = null
  },
  setCategoriesFromLoadMore(state, payload) {
    state.categoriesMore = [...state.categoriesMore, ...(payload.data || [])]
    state.count -= (payload.data || []).length || 0
    state.error = null
  },
  setCategory(state, payload) {
    state.category = payload || null
    state.error = null
  },
  setError(state, payload) {
    state.error = payload
  }
}

export const actions = {
  async getCategories({commit}, params = {}) {
    await getCategories(params).then(({data}) => {
      if (params.isLoadMore)
        commit("setCategoriesFromLoadMore", data)
      else
        commit("setCategories", data)
    }).catch((err) => {
      commit("setCategories", {})
      commit("setError", {
        message: err.response.data.message || 'Unknown Error',
        statusCode: err.response.status || 500
      })
    })
  },
  async getCategory({commit}, {param}) {
    await getCategory(param).then(({data}) => {
      commit("setCategory", data)
    }).catch(err => {
      commit("setCategory", null)
      commit("setError", {
        message: err.response.data.message || 'Unknown Error',
        statusCode: err.response.status || 500
      })
    })
  },
}
