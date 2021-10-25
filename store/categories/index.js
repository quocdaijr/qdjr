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
    await this.$axios.$get("/categories", {
      params: {
        page: params.page || 1,
        perPage: params.perPage || 2
      }
    }).then((res) => {
      if (params.isLoadMore)
        commit("setCategoriesFromLoadMore", res)
      else
        commit("setCategories", res)
    }).catch((err) => {
      commit("setCategories", {})
      commit("setError", {
        message: err.response.data.message || 'Unknown Error',
        statusCode: err.response.status || 500
      })
    })
  },
  async getCategory({commit}, {param}) {
    await this.$axios.$get("/category/" + param)
      .then((res) => {
        commit("setCategory", res)
      })
      .catch(err => {
        commit("setCategory", null)
        commit("setError", {
          message: err.response.data.message || 'Unknown Error',
          statusCode: err.response.status || 500
        })
      })
  },
}
