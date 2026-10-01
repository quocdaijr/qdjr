<template>
  <div class="w-full">
    <HeaderContent :title="category" :description="t('blog.categoryDescription', {category})"/>

    <section v-if="!posts || !posts.length"
             class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-500 pt-2">{{ t('blog.categoryEmpty') }}</span>
      <NuxtLinkLocale to="/blog" class="mt-4 text-base text-blue-600 hover:underline dark:text-blue-400">{{ t('blog.back') }}</NuxtLinkLocale>
    </section>

    <section v-else class="py-10 max-w-(--breakpoint-lg) mx-auto">
      <NuxtLinkLocale v-for="post in posts" :key="post.path" :to="post.path" :lang="post.originalOnly ? 'vi' : undefined"
                class="block py-4 px-2 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ post.title }}</h2>
        <PostTranslationBadge :post="post"/>
        <p v-if="post.description" class="text-gray-600 dark:text-gray-300 mt-1">{{ post.description }}</p>
        <span class="text-xs text-gray-600 dark:text-gray-400">{{ formatPostDate(post.publishedAt, locale) }}</span>
      </NuxtLinkLocale>
    </section>
  </div>
</template>

<script setup lang="ts">
// The useAsyncData key is built from `category` at setup; the page remounts on
// every route change, which this makes an explicit guarantee.
definePageMeta({key: (route) => route.fullPath})

const route = useRoute()
const {t, locale} = useI18n()
const category = computed(() => String(route.params.category || ''))

useHead(() => ({title: `${category.value} | ${t('blog.siteSuffix')}`}))

const {data: posts} = await useAsyncData(`blog-cat-${locale.value}-${category.value}`, () =>
  fetchBlogPosts(locale.value).then((list) => list.filter((p) => p.category === category.value))
)
</script>
