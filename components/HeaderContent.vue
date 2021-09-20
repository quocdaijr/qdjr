<template>
  <header class="px-6 py-12 border-b border-gray-200 lg:px-8 xl:pt-16 dark:border-gray-600">
    <div class="max-w-screen-lg mx-auto font-semibold text-center">
      <h1 v-if="title" class="text-3xl font-bold text-gray-800 lg:text-5xl dark:text-gray-100">{{ title }}</h1>
      <p v-if="description" class="mt-4 text-base text-gray-500 md:text-lg dark:text-gray-300">{{ description }}</p>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderContent",
  props: {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null
    }
  }
}
</script>
