<template>
  <div class="h-full">
    <LegacyUnavailable v-if="unavailable"/>
    <template v-else-if="post">
      <HeaderContent :title="post.title" :background="post.cover || ''"/>
      <PostDetail :post="post"/>
    </template>
    <section v-else-if="pending"
             class="flex flex-col items-center my-10 text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-400 pt-2">Loading…</span>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'LegacyPostBySlug'})

// Was a Nuxt 2 validate({ params }) hook.
definePageMeta({
  validate: (route) => /^[a-z0-9-]+$/.test(String(route.params.slug))
})

const route = useRoute()
const config = useRuntimeConfig()
const postsStore = usePostsStore()

const slug = computed(() => String(route.params.slug))

const {data: post, pending, unavailable, notFound} = useLegacyResource(
  `legacy-post-${slug.value}`,
  () => postsStore.getPost(slug.value),
  () => postsStore.post,
  () => postsStore.error
)

// Only 404 when a reachable API said this post does not exist. A dead backend
// renders the offline panel instead — see useLegacyResource.
if (notFound.value) {
  throw createError({statusCode: 404, statusMessage: 'Page Not Found', fatal: true})
}

const tags = computed(() =>
  (post.value?.tags || []).map((t) => t.name).filter(Boolean)
)

const fullUrl = computed(
  () => `${config.public.baseUrl}/legacy-blogs/${post.value?.slug ?? ''}`
)

const toIso = (value?: string) => {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

useHead(() => ({
  title: post.value?.title ? `${post.value.title} | QDJr Blog` : 'QDJr Blog',
  // `keywords` is not a useSeoMeta key in Unhead v3; it belongs in raw meta.
  meta: [{name: 'keywords', content: tags.value.join(', ')}]
}))

// Was a Nuxt 2 head() with `hid` on every meta entry. `hid` was removed in
// Unhead v2; useSeoMeta dedupes by tag identity on its own.
//
// Three latent bugs fixed here: og:title read post.name (a field the Post type
// does not have, so it emitted "undefined | QDJr Blog"), og:url pointed at the
// old legacy-as-site-root path, and process.env.APP_URL is undefined at runtime
// so the hardcoded fallback always won.
useSeoMeta({
  description: () => post.value?.description || '',
  ogType: 'article',
  ogUrl: () => fullUrl.value,
  ogTitle: () => (post.value?.title ? `${post.value.title} | QDJr Blog` : ''),
  ogDescription: () => post.value?.description || '',
  ogImage: () => post.value?.thumbnail || '',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  articlePublishedTime: () => toIso(post.value?.published_at),
  articleModifiedTime: () => toIso(post.value?.updated_at),
  articleAuthor: () => (post.value?.author ? [post.value.author] : []),
  // Was a hand-rolled extraMeta loop pushing one article:tag per tag.
  articleTag: () => tags.value
})
</script>
