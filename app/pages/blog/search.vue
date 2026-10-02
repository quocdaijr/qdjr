<template>
  <div class="w-full">
    <HeaderContent
      :title="q ? t('blog.searchTitleQuery', {q}) : t('blog.searchTitle')"
      :description="q ? t('blog.searchResults', {count: results.length}, results.length) : t('blog.searchHint')"
    />

    <section v-if="!q"
             class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-500 pt-2">{{ t('blog.searchEnter') }}</span>
      <NuxtLinkLocale to="/blog" class="mt-4 text-base text-blue-600 hover:underline dark:text-blue-400">{{ t('blog.back') }}</NuxtLinkLocale>
    </section>

    <section v-else-if="!results.length"
             class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-500 pt-2">{{ t('blog.searchNoMatch', {q}) }}</span>
      <NuxtLinkLocale to="/blog" class="mt-4 text-base text-blue-600 hover:underline dark:text-blue-400">{{ t('blog.back') }}</NuxtLinkLocale>
    </section>

    <section v-else class="py-10 max-w-(--breakpoint-lg) mx-auto">
      <NuxtLinkLocale v-for="post in results" :key="post.path" :to="post.path"
                class="block py-4 px-2 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100" :lang="post.originalOnly ? 'vi' : undefined">{{ post.title }}</h2>
        <PostTranslationBadge :post="post"/>
        <p v-if="post.description" class="text-gray-600 dark:text-gray-300 mt-1" :lang="post.originalOnly ? 'vi' : undefined">{{ post.description }}</p>
        <span class="text-xs text-gray-600 dark:text-gray-400">{{ formatPostDate(post.publishedAt, locale) }}</span>
      </NuxtLinkLocale>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const {t, locale} = useI18n()

const q = computed(() => String(route.query.q ?? '').trim())

useHead(() => ({
  title: q.value ? `${t('blog.searchTitleQuery', {q: q.value})} | ${t('blog.siteSuffix')}` : `${t('blog.searchTitle')} | ${t('blog.siteSuffix')}`
}))

// Search result pages should not be indexed.
useSeoMeta({robots: 'noindex, follow'})

// The corpus is small enough to fetch once and filter client-side (see
// ~/utils/search for the diacritic folding the Vietnamese titles need).
const {data: posts} = await useAsyncData(`blog-search-corpus-${locale.value}`, () => fetchBlogPosts(locale.value))

const results = computed(() => {
  if (!q.value) return []
  return (posts.value || []).filter((post) => matchesQuery(post, q.value))
})
</script>
