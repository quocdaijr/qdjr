<template>
  <nav v-if="device === 'mobile'" class="divide-y divide-dotted">
    <NuxtLink to="/blog"
              class="flex items-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
      <span class="w-full" @click="methodToggleNav">Blog</span>
    </NuxtLink>
    <NuxtLink to="/about"
              class="flex items-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
      <span class="w-full" @click="methodToggleNav">About</span>
    </NuxtLink>
    <div v-if="categories" v-click-outside="closeCatMenu"
         class="relative flex items-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
      <div class="w-full flex justify-between items-center" @click="toggleCatMenu">
        <span>Categories</span>
        <svg ref="iconCloseCatMenu" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20"
             fill="currentColor">
          <path fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"/>
        </svg>
        <svg ref="iconOpenCatMenu" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 hidden" viewBox="0 0 20 20"
             fill="currentColor">
          <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"/>
        </svg>
      </div>
      <ul ref="catMenu"
          class="absolute top-4 mt-10 p-2 rounded-md shadow-lg z-10 w-11/12 hidden bg-gray-300 dark:bg-gray-700">
        <li v-for="category in categories" :key="category.id"
            class="p-1 mb-1 whitespace-no-wrap rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105"
            @click="methodToggleNav"
        >
          <NuxtLink class="block" :to="`/category/${category.slug}`">
            <span>{{ category.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
  <nav v-else class="flex justify-end">
    <NuxtLink to="/blog"
              class="flex items-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300
               hover:scale-125 hover:text-blue-600 dark:hover:text-blue-400">
      <span>Blog</span>
    </NuxtLink>
    <NuxtLink to="/about"
              class="flex items-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300
               hover:scale-125 hover:text-blue-600 dark:hover:text-blue-400">
      <span>About</span>
    </NuxtLink>
    <div v-if="categories" v-click-outside="closeCatMenu"
         class="relative flex items-center py-3 font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
      <svg ref="iconCloseCatMenu" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:scale-125" viewBox="0 0 20 20"
           fill="currentColor"
           @click="toggleCatMenu">
        <path fill-rule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
              clip-rule="evenodd"/>
      </svg>
      <svg ref="iconOpenCatMenu" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:scale-125 hidden"
           viewBox="0 0 20 20" fill="currentColor"
           @click="toggleCatMenu"
      >
        <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"/>
      </svg>
      <ul ref="catMenu"
          class="absolute origin-top-right left-[-7.8rem] -left-24 top-0 mt-10 p-2 rounded-md shadow-lg z-10 w-36 hidden bg-white dark:bg-gray-700">
        <li v-for="category in categories" :key="category.id"
            class="p-1 mb-1 whitespace-no-wrap rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105"
            @click="closeCatMenu"
        >
          <NuxtLink class="block" :to="`/category/${category.slug}`">
            <span>{{ category.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import ClickOutside from "~/plugins/click-outside"

export default {
  name: "NavBar",
  directives: {ClickOutside},
  props: {
    device: {
      type: String,
      default: 'pc'
    },
    methodToggleNav: {
      type: Function,
      default: () => {
      }
    },
    categories: {
      type: Array,
      default: null
    }
  },
  methods: {
    toggleCatMenu() {
      this.$refs.catMenu.classList.toggle('hidden')
      this.$refs.iconCloseCatMenu.classList.toggle('hidden')
      this.$refs.iconOpenCatMenu.classList.toggle('hidden')
    },
    closeCatMenu() {
      this.$refs.catMenu.classList.add('hidden')
      this.$refs.iconCloseCatMenu.classList.remove('hidden')
      this.$refs.iconOpenCatMenu.classList.add('hidden')
    }
  }
}
</script>
