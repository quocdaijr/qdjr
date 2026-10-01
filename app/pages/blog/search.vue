<template>
  <div class="w-full">
    <HeaderContent
      :title="q ? `Search: ${q}` : 'Search'"
      :description="q ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Find a post by title, description, tag or category.'"
    />

    <section v-if="!q"
             class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-400 pt-2">Enter a search term above</span>
      <NuxtLink to="/blog" class="mt-4 text-base text-blue-600 hover:underline dark:text-blue-400">Back to blog</NuxtLink>
    </section>

    <section v-else-if="!results.length"
             class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-400 pt-2">No posts match “{{ q }}”</span>
      <NuxtLink to="/blog" class="mt-4 text-base text-blue-600 hover:underline dark:text-blue-400">Back to blog</NuxtLink>
    </section>

    <section v-else class="py-10 max-w-(--breakpoint-lg) mx-auto">
      <NuxtLink v-for="post in results" :key="post.path" :to="post.path"
                class="block py-4 px-2 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ post.title }}</h2>
        <p v-if="post.description" class="text-gray-600 dark:text-gray-300 mt-1">{{ post.description }}</p>
        <span class="text-xs text-gray-500">{{ formatDate(post.publishedAt) }}</span>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const q = computed(() => String(route.query.q ?? '').trim())

useHead(() => ({
  title: q.value ? `Search: ${q.value} | QDJr Blog` : 'Search | QDJr Blog'
}))

// Search result pages should not be indexed.
useSeoMeta({robots: 'noindex, follow'})

// The corpus is small enough to fetch once and filter client-side, which also
// matches the pattern already used by the tag and category pages.
// queryCollectionSearchSections would pull every section body into the browser;
// swap to it if the post count ever makes this filter inadequate.
const {data: posts} = await useAsyncData('blog-search-corpus', () =>
  queryCollection('blog')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .all()
)

// Matching lives in ~/utils/search so the rules — including the diacritic
// folding the Vietnamese titles depend on — can be unit-tested directly.
const results = computed(() => {
  if (!q.value) return []
  return (posts.value || []).filter((post) => matchesQuery(post, q.value))
})

function formatDate(value: string | Date | undefined) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
}
</script>
