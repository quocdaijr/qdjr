<template>
  <div class="flex overflow-x-scroll p-2 hide-scroll-bar">
    <div v-if="tags.length" class="md:text-sm text-gray-500 mt-6 flex flex-nowrap whitespace-nowrap">
      <div v-for="tag in tags" :key="tag.id"
           class="text-xs inline-flex items-center font-bold leading-sm px-3 py-1 mr-1 rounded-full
           bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
        <NuxtLink :to="`/legacy-blogs/tag/${tag.slug}`" class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span class="h-6 pl-1 pt-1 mb-1 text-sm no-underline hover:underline">{{ tag.name }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'TagListNewest'})

// Was a Nuxt 2 `async fetch()` dispatching against the removed Vuex store, so
// this never populated under Nuxt 3.
const props = withDefaults(
  defineProps<{page?: number; perPage?: number}>(),
  {page: 1, perPage: 5}
)

const tagsStore = useTagsStore()

await useAsyncData(
  `legacy-tags-newest-${props.page}-${props.perPage}`,
  async () => {
    await tagsStore.getTags({page: props.page, perPage: props.perPage})
    return true
  }
)

// The store swallows errors and leaves tags as [], so when the API is offline
// this simply renders nothing rather than an empty scrolling strip.
const tags = computed(() => tagsStore.tags)
</script>
