<template>
  <header class=" flex-col px-6 py-12 border-b border-gray-200 lg:px-8 xl:pt-16 dark:border-gray-600">
    <div v-if="background" class="max-w-screen-lg mx-auto font-semibold text-center flex-grow">
      <img :src="$urlResize ? $urlResize(background, '720p') : background || ''"
           :title="title"
           class="w-full max-h-48 shadow-md"
           :alt="title || 'Header background image'"
           @error="handleImageError">
    </div>
    <div class="max-w-screen-lg mx-auto font-semibold text-center mt-4">
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
    },
    background: {
      type: String,
      default: null
    }
  },
  methods: {
    handleImageError(event) {
      console.warn('Header background image failed to load:', event.target.src)
      // Optionally hide the image container or show a fallback
      event.target.style.display = 'none'
    }
  }
}
</script>
