import {describe, expect, test} from 'vitest'
import {setMockApi} from './setup'
import {usePostsStore} from '~/stores/posts'
import {useCategoriesStore} from '~/stores/categories'
import {useTagsStore} from '~/stores/tags'

const post = (id: number) => ({
  id,
  slug: `post-${id}`,
  title: `Post ${id}`,
  published_at: '2024-01-01',
  thumbnail: '',
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
})

/** A $fetch-style rejection, matching what the store's catch block reads. */
const httpError = (status: number, message = 'Boom') =>
  Object.assign(new Error(message), {status, data: {message}})

describe('posts store', () => {
  test('stores a page of posts and the remaining count', async () => {
    setMockApi({
      enabled: true,
      getPosts: async () => ({status: 200, data: {data: [post(1), post(2)], total: 5}})
    })

    const store = usePostsStore()
    await store.getPosts()

    expect(store.posts).toHaveLength(2)
    expect(store.count).toBe(3) // 5 total - 2 loaded
    expect(store.error).toBeNull()
  })

  test('appends load-more results without dropping the first page', async () => {
    setMockApi({
      enabled: true,
      getPosts: async (params: {isLoadMore?: boolean}) =>
        params?.isLoadMore
          ? {status: 200, data: {data: [post(3)]}}
          : {status: 200, data: {data: [post(1), post(2)], total: 3}}
    })

    const store = usePostsStore()
    await store.getPosts()
    await store.getPosts({isLoadMore: true})

    expect(store.posts).toHaveLength(2)
    expect(store.postsMore).toHaveLength(1)
    expect(store.allPosts).toHaveLength(3)
    expect(store.count).toBe(0)
  })

  test('records the status code on failure instead of throwing', async () => {
    setMockApi({
      enabled: true,
      getPosts: async () => {
        throw httpError(500)
      }
    })

    const store = usePostsStore()
    await expect(store.getPosts()).resolves.toBeUndefined()

    expect(store.posts).toEqual([])
    expect(store.error?.statusCode).toBe(500)
    expect(store.hasError).toBe(true)
  })

  test('defaults to 500 when the rejection carries no status', async () => {
    setMockApi({
      enabled: true,
      getPosts: async () => {
        throw new Error('network down')
      }
    })

    const store = usePostsStore()
    await store.getPosts()

    expect(store.error?.statusCode).toBe(500)
  })

  test('preserves a 404 so callers can tell it apart from a dead backend', async () => {
    setMockApi({
      enabled: true,
      getPost: async () => {
        throw httpError(404, 'Not Found')
      }
    })

    const store = usePostsStore()
    await store.getPost('missing')

    expect(store.post).toBeNull()
    expect(store.error?.statusCode).toBe(404)
  })

  test('clears a previous error before the next request resolves', async () => {
    // Regression: the store is a session singleton under ssr: false, so a stale
    // error from a failed route would flash on the next one until it resolved.
    let shouldFail = true
    setMockApi({
      enabled: true,
      getPosts: async () => {
        if (shouldFail) throw httpError(500)
        return {status: 200, data: {data: [post(1)], total: 1}}
      }
    })

    const store = usePostsStore()
    await store.getPosts()
    expect(store.error).not.toBeNull()

    shouldFail = false
    const inFlight = store.getPosts()
    // The error must already be gone at this point, not only after resolution.
    expect(store.error).toBeNull()
    await inFlight

    expect(store.error).toBeNull()
    expect(store.posts).toHaveLength(1)
  })

  test('clearError resets the error', async () => {
    setMockApi({
      enabled: true,
      getPosts: async () => {
        throw httpError(503)
      }
    })

    const store = usePostsStore()
    await store.getPosts()
    expect(store.hasError).toBe(true)

    store.clearError()
    expect(store.error).toBeNull()
    expect(store.hasError).toBe(false)
  })
})

const category = (id: number) => ({id, slug: `cat-${id}`, name: `Category ${id}`})
const tag = (id: number) => ({id, slug: `tag-${id}`, name: `Tag ${id}`})

describe('categories store', () => {
  test('stores a fetched category', async () => {
    setMockApi({
      enabled: true,
      getCategory: async () => ({data: {id: 1, slug: 'tools', name: 'Tools'}})
    })

    const store = useCategoriesStore()
    await store.getCategory('tools')

    expect(store.category?.name).toBe('Tools')
    expect(store.currentCategory?.slug).toBe('tools')
    expect(store.error).toBeNull()
  })

  test('records failures without throwing', async () => {
    setMockApi({
      enabled: true,
      getCategory: async () => {
        throw httpError(500)
      }
    })

    const store = useCategoriesStore()
    await expect(store.getCategory('tools')).resolves.toBeUndefined()
    expect(store.category).toBeNull()
    expect(store.error?.statusCode).toBe(500)
  })

  test('stores a page of categories and the remaining count', async () => {
    setMockApi({
      enabled: true,
      getCategories: async () => ({
        status: 200,
        data: {data: [category(1), category(2)], total: 4}
      })
    })

    const store = useCategoriesStore()
    await store.getCategories()

    expect(store.categories).toHaveLength(2)
    expect(store.count).toBe(2)
    expect(store.hasMoreCategories).toBe(true)
  })

  test('appends load-more categories', async () => {
    setMockApi({
      enabled: true,
      getCategories: async (params: {isLoadMore?: boolean}) =>
        params?.isLoadMore
          ? {status: 200, data: {data: [category(3)]}}
          : {status: 200, data: {data: [category(1), category(2)], total: 3}}
    })

    const store = useCategoriesStore()
    await store.getCategories()
    await store.getCategories({isLoadMore: true})

    expect(store.allCategories).toHaveLength(3)
    expect(store.hasMoreCategories).toBe(false)
  })

  test('empties the list and records the error on a failed listing', async () => {
    setMockApi({
      enabled: true,
      getCategories: async () => {
        throw httpError(503)
      }
    })

    const store = useCategoriesStore()
    await store.getCategories()

    expect(store.categories).toEqual([])
    expect(store.error?.statusCode).toBe(503)
    store.clearError()
    expect(store.hasError).toBe(false)
  })
})

describe('tags store', () => {
  test('stores a page of tags', async () => {
    setMockApi({
      enabled: true,
      getTags: async () => ({status: 200, data: {data: [tag(1)], total: 1}})
    })

    const store = useTagsStore()
    await store.getTags()

    expect(store.tags).toHaveLength(1)
    expect(store.hasMoreTags).toBe(false)
  })

  test('appends load-more tags', async () => {
    setMockApi({
      enabled: true,
      getTags: async (params: {isLoadMore?: boolean}) =>
        params?.isLoadMore
          ? {status: 200, data: {data: [tag(3)]}}
          : {status: 200, data: {data: [tag(1), tag(2)], total: 3}}
    })

    const store = useTagsStore()
    await store.getTags()
    await store.getTags({isLoadMore: true})

    expect(store.allTags).toHaveLength(3)
  })

  test('leaves tags empty on failure so the strip renders nothing', async () => {
    setMockApi({
      enabled: true,
      getTags: async () => {
        throw httpError(500)
      }
    })

    const store = useTagsStore()
    await store.getTags()

    expect(store.tags).toEqual([])
    expect(store.error?.statusCode).toBe(500)
  })

  test('stores a single tag and preserves a 404', async () => {
    setMockApi({
      enabled: true,
      getTag: async () => ({data: tag(7)})
    })

    const store = useTagsStore()
    await store.getTag('tag-7')
    expect(store.currentTag?.id).toBe(7)

    setMockApi({
      enabled: true,
      getTag: async () => {
        throw httpError(404, 'Not Found')
      }
    })
    await store.getTag('missing')

    expect(store.tag).toBeNull()
    expect(store.error?.statusCode).toBe(404)
  })
})
