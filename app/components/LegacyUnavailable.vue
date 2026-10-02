<template>
  <section class="flex flex-col items-center my-16 text-center text-gray-500 dark:text-gray-300">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"/>
    </svg>
    <p class="text-2xl pt-2">The legacy blog archive is offline.</p>
    <p class="text-base text-gray-400 pt-2 max-w-md">
      These posts were served by an API that no longer exists. Everything written
      since lives in the current blog.
    </p>
    <NuxtLink to="/blog" class="mt-6 text-base text-blue-600 hover:underline dark:text-blue-400">
      Go to the blog
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
defineOptions({name: 'LegacyUnavailable'})
</script>
