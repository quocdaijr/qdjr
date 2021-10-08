<template>
  <nav v-if="device === 'mobile'" class="divide-y divide-dotted">
    <NuxtLink to="/blog"
              class="flex items-center px-5 py-3 space-x-1 font-semibold text-gray-600
              dark:text-gray-300 active:text-blue-600 active:dark:text-blue-400">
      <span @click="methodToggleNav" class="w-full">Blog</span>
    </NuxtLink>
    <NuxtLink to="/about"
              class="flex items-center px-5 py-3 space-x-1 font-semibold text-gray-600
              dark:text-gray-300 active:text-blue-600 active:dark:text-blue-400">
      <span @click="methodToggleNav" class="w-full" >About</span>
    </NuxtLink>
  </nav>
  <nav v-else class="flex justify-end space-x-2 md:space-x-4">
    <NuxtLink to="/blog"
              class="flex items-center px-5 py-3 space-x-1 font-semibold text-gray-600 hover:scale-125
              dark:text-gray-300 active:text-blue-600 active:dark:text-blue-400">
      <span>Blog</span>
    </NuxtLink>
    <NuxtLink to="/about"
              class="flex items-center px-5 py-3 space-x-1 font-semibold text-gray-600 hover:scale-125
              dark:text-gray-300 active:text-blue-600 active:dark:text-blue-400">
      <span>About</span>
    </NuxtLink>
  </nav>
</template>

<script>
export default {
  name: "NavBar",
  props: {
    device: {
      type: String,
      default: 'pc'
    },
    methodToggleNav: {
      type: Function,
      default: () => {}
    }
  },
  mounted() {
    this.methodToggleNav();
  }
}
</script>
