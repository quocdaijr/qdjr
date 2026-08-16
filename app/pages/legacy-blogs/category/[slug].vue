<template>
  <div class="w-full">
    <LegacyUnavailable v-if="unavailable"/>
    <template v-else-if="category">
      <HeaderContent :title="category.name" :description="category.description" :background="category.cover || ''"/>
      <PostList list-type="byCategory" :extra-value="String(category.id)"/>
    </template>
    <section v-else-if="pending"
             class="flex flex-col items-center my-10 text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-400 pt-2">Loading…</span>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'LegacyCategoryDetail'})

definePageMeta({
  validate: (route) => /^[a-z0-9-]+$/.test(String(route.params.slug))
})

const route = useRoute()
const config = useRuntimeConfig()
const categoriesStore = useCategoriesStore()

const slug = computed(() => String(route.params.slug))

const {data: category, pending, unavailable, notFound} = useLegacyResource(
  `legacy-category-${slug.value}`,
  () => categoriesStore.getCategory(slug.value),
  () => categoriesStore.category,
  () => categoriesStore.error
)

if (notFound.value) {
  throw createError({statusCode: 404, statusMessage: 'Page Not Found', fatal: true})
}

// The template previously called category.id.toString() on a value that starts
// as null, which threw on first render before asyncData resolved. It is guarded
// behind v-else-if="category" now.
useHead(() => ({title: category.value?.name || 'QDJr Blog'}))

// `hid` keys dropped: removed in Unhead v2. og:* were also declared with `name:`
// rather than `property:`; useSeoMeta emits the correct form.
useSeoMeta({
  description: () => category.value?.description || '',
  keywords: () => category.value?.name || '',
  ogUrl: () =>
    `${config.public.baseUrl}/legacy-blogs/category/${category.value?.slug ?? ''}`,
  ogTitle: () => (category.value?.name ? `${category.value.name} | QDJr Blog` : ''),
  ogDescription: () => category.value?.description || '',
  ogImage: () => category.value?.cover || ''
})
</script>
