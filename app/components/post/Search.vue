<template>
  <div class="flex justify-end">
    <form action="/blog/search" role="search" @submit.prevent="submit"
          class="w-3/4 shadow p-1 rounded-lg flex mx-auto bg-gray-50 text-gray-600 border border-gray-300 hover:border-gray-400
     dark:text-gray-300 dark:bg-gray-700 dark:border-gray-700 dark:hover:border-gray-500">
      <label for="site-search" class="sr-only">Search posts</label>
      <input id="site-search" v-model="q" name="q" type="search"
             class="w-full rounded p-1 focus:outline-hidden bg-gray-50 dark:bg-gray-700"
             placeholder="Search post ...">
      <button type="submit" aria-label="Search">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'PostSearch'})

// This form used to submit to /search — a route that has never existed, so the
// header search box 404'd on every use. It now searches the @nuxt/content blog.
//
// Keeping `action` and `name="q"` means it still works with JS disabled; the
// @submit.prevent handler upgrades that to a client-side transition.
//
// The old `data()` also read this.$route at construction: it never updated, and
// it depended on a vue-router global property in a component that Header.vue
// renders on every route.
const route = useRoute()
const router = useRouter()

const q = ref(String(route.query.q ?? ''))

// Header.vue renders two instances (desktop and mobile); keep both in sync with
// the URL.
watch(
  () => route.query.q,
  (value) => {
    q.value = String(value ?? '')
  }
)

function submit() {
  const term = q.value.trim()
  if (!term) return
  router.push({path: '/blog/search', query: {q: term}})
}
</script>
