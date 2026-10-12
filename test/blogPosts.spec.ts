import {describe, expect, test} from 'vitest'
import {setMockApi} from './setup'
import {fetchBlogPosts, toBlogPost} from '~/composables/useBlogPosts'
import type {ApiPost} from '~/plugins/api'

const post: ApiPost = {
  id: '1',
  slug: 'hello-world',
  title: 'Hello',
  excerpt: 'desc',
  content: '# Body',
  published_at: '2026-04-19T02:00:00Z',
  thumbnail: null,
  location: null,
  category: null,
  tags: [{id: 't', slug: 'nuxt', name: 'Nuxt'}],
  created_at: '2026-04-19T02:00:00Z',
  updated_at: '2026-04-19T03:00:00Z'
}

describe('toBlogPost', () => {
  test('maps API fields to the page shape and copes with no category/thumbnail', () => {
    const vi = toBlogPost(post, 'vi')
    expect(vi).toMatchObject({path: '/blog/hello-world', title: 'Hello', description: 'desc', tags: ['nuxt']})
    expect(vi.category).toBeUndefined()
    expect(vi.thumbnail).toBeUndefined()
    expect(vi.html).toBeUndefined()
    expect(vi.originalOnly).toBeUndefined()
  })

  test('flags English pages as original-only and renders the body on demand', () => {
    const en = toBlogPost({...post, category: {id: 'c', slug: 'meta', name: 'Meta'}}, 'en', true)
    expect(en.originalOnly).toBe(true)
    expect(en.category).toBe('meta')
    expect(en.html).toContain('<h1>Body</h1>')
  })
})

describe('fetchBlogPosts', () => {
  test('passes the filter through and maps the list', async () => {
    const calls: unknown[] = []
    setMockApi({listPosts: async (f: unknown) => (calls.push(f), {posts: [post], total: 1})})
    const list = await fetchBlogPosts('vi', {tag: 'nuxt'})
    expect(list.map((p) => p.slug)).toEqual(['hello-world'])
    expect(calls[0]).toMatchObject({tag: 'nuxt'})
  })

  test('returns an empty list when the API is down', async () => {
    setMockApi({listPosts: async () => { throw new Error('ECONNREFUSED') }})
    expect(await fetchBlogPosts('vi')).toEqual([])
  })
})
