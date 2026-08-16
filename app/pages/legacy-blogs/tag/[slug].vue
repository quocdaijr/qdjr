<template>
  <div class="w-full">
    <LegacyUnavailable v-if="unavailable"/>
    <template v-else-if="tag">
      <HeaderContent :title="tag.name" :description="tag.description" :background="tag.cover || ''"/>
      <PostList list-type="byTag" :extra-value="String(tag.id)"/>
    </template>
    <section v-else-if="pending"
             class="flex flex-col items-center my-10 text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-400 pt-2">Loading…</span>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'LegacyTagDetail'})

definePageMeta({
  validate: (route) => /^[a-z0-9-]+$/.test(String(route.params.slug))
})

const route = useRoute()
const config = useRuntimeConfig()
const tagsStore = useTagsStore()

const slug = computed(() => String(route.params.slug))

const {data: tag, pending, unavailable, notFound} = useLegacyResource(
  `legacy-tag-${slug.value}`,
  () => tagsStore.getTag(slug.value),
  () => tagsStore.tag,
  () => tagsStore.error
)

if (notFound.value) {
  throw createError({statusCode: 404, statusMessage: 'Page Not Found', fatal: true})
}

// The template previously called tag.id.toString() on a value that starts as
// null, which threw on first render before asyncData resolved.
useHead(() => ({title: tag.value?.name || 'QDJr Blog'}))

useSeoMeta({
  description: () => tag.value?.description || '',
  keywords: () => tag.value?.name || '',
  ogUrl: () => `${config.public.baseUrl}/legacy-blogs/tag/${tag.value?.slug ?? ''}`,
  ogTitle: () => (tag.value?.name ? `${tag.value.name} | QDJr Blog` : ''),
  ogDescription: () => tag.value?.description || '',
  ogImage: () => tag.value?.cover || ''
})
</script>
