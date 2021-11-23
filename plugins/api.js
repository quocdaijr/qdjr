import axios from "axios";

const API_URL = process.env.apiUrl || process.env.API_URL || ''

// Api for category

export const getCategories = async (params = {}) => {
  return await axios.get(API_URL + '/categories', {
    params: {
      page: params.page || 1,
      perPage: params.perPage || 10
    }
  })
}

export const getCategory = async (param) => {
  return await axios.get(API_URL + '/category/' + param)
}

// Api for tag

export const getTags = async (params = {}) => {
  return await axios.get(API_URL + '/tags', {
    params: {
      page: params.page || 1,
      perPage: params.perPage || 10
    }
  })
}

export const getTag = async (param) => {
  return await axios.get(API_URL + '/tag/' + param)
}

// Api for post

export const getPosts = async (params = {}) => {
  return await axios.get(API_URL + '/posts', {
    params: {
        txt: params.txt || "",
        page: params.page || 1,
        perPage: params.perPage || 5,
        tag: params.tag || "",
        category: params.category || "",
    }
  })
}

export const getPost = async (param) => {
  return await axios.get(API_URL + '/post/' + param)
}
