<template>
  <div class="w-full">
    <HeaderContent :title="category" :description="`Posts in ${category}.`"/>

    <section v-if="!posts || !posts.length"
             class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-400 pt-2">No posts in this category</span>
      <NuxtLink to="/blog" class="mt-4 text-base text-blue-500 hover:underline">Back to blog</NuxtLink>
    </section>

    <section v-else class="py-10 max-w-screen-lg mx-auto">
      <NuxtLink v-for="post in posts" :key="post.path" :to="post.path"
                class="block py-4 px-2 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ post.title }}</h2>
        <p v-if="post.description" class="text-gray-600 dark:text-gray-300 mt-1">{{ post.description }}</p>
        <span class="text-xs text-gray-500">{{ formatDate(post.publishedAt) }}</span>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

// The useAsyncData key below is built from `category`, which is evaluated once at
// setup. That is only correct because the page remounts on every route change.
// Nuxt 4's data layer shares data/error/status refs between same-key callers, so
// make the remount an explicit guarantee rather than an incidental one.
definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const category = computed(() => String(route.params.category || ''))

useHead(() => ({ title: `${category.value} | QDJr Blog` }))

const { data: posts } = await useAsyncData(`blog-cat-${category.value}`, () =>
  queryCollection('blog')
    .where('draft', '=', false)
    .where('category', '=', category.value)
    .order('publishedAt', 'DESC')
    .all()
)

function formatDate(value: string | Date | undefined) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
