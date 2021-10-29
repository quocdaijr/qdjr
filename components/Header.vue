<template>
  <header class="sm:px-4 py-4 lg:px-8 lg:py-6">
    <div class="hidden sm:flex items-center justify-between max-w-screen-lg mx-auto">
      <div class="w-1/12 flex justify-start">
        <NuxtLink to="/" class="inline-block mb-1 hover:scale-125">
          <span class="sr-only">QDJr</span>
          <img class="w-10 pt-2" :src="isDarkMode ? '/logo-dark.svg' : '/logo.svg'" alt="QDJr">
        </NuxtLink>
      </div>
      <PostSearch class="w-7/12"/>
      <NavBar class="w-3/12" device="pc" :categories="categories"/>
      <div class="w-1/12 flex justify-end">
        <button
          :class="'w-8 h-8 rounded-full text-white flex items-center transition duration-300 shadow-xl hover:scale-125 ' + (isDarkMode ? 'bg-gray-500': 'bg-yellow-500')"
          @click="toggleTheme"
        >
          <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="sm:hidden flex items-center max-w-screen-lg mx-auto">
      <div v-click-outside="closeNav" class="w-2/12 flex justify-center">
        <button type="button" class="w-10 h-10 ml-1 mr-1 rounded" @click="toggleNav">
          <svg v-if="isOpenMenu" xmlns="http://www.w3.org/2000/svg" class="text-gray-900 dark:text-gray-100"
               viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
               class="text-gray-900 dark:text-gray-100">
            <path fill-rule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"></path>
          </svg>
        </button>
        <div
          ref="navMobile"
          class="nav-mobile fixed w-11/12 h-full rounded-r-lg top-14 left-0 bg-gray-200 dark:bg-gray-800 z-50 opacity-95 transform ease-in-out duration-300 -translate-x-full">
          <NavBar device="mobile" :method-toggle-nav="toggleNav" :categories="categories"/>
        </div>
      </div>
      <PostSearch class="w-6/12 h-10"/>
      <div class="w-2/12 flex justify-end">
        <button
          :class="'w-8 h-8 rounded-full text-white flex items-center transition duration-300 shadow-xl hover:scale-125 ' + (isDarkMode ? 'bg-gray-500': 'bg-yellow-500')"
          @click="toggleTheme"
        >
          <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div class="w-2/12 flex justify-end">
        <NuxtLink to="/" class="inline-block hover:scale-125">
          <span class="sr-only">QDJr</span>
          <img class="w-10" :src="isDarkMode ? '/logo-dark.svg' : '/logo.svg'" alt="QDJr">
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script>
import NavBar from "~/components/NavBar";
import PostSearch from "~/components/post/Search";
import ClickOutside from "~/plugins/click-outside"

export default {
  name: "Header",
  components: {PostSearch, NavBar},
  directives: {ClickOutside},
  data() {
    return {
      isDarkMode: false,
      isOpenMenu: false,
      categories: null
    }
  },
  async fetch() {
    await this.$store.dispatch("categories/getCategories")
    this.categories = this.$store.state.categories.categories || []
  },
  mounted() {
    this.$nextTick(() => {
      const isDarkMode = localStorage.getItem('isDarkMode')
      this.isDarkMode = (isDarkMode || 'false').toString().toLowerCase() === 'true'
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark')
      }
      this.isOpenMenu = false
    })
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('isDarkMode', this.isDarkMode)
      document.documentElement.classList.toggle('dark')
    },
    toggleNav() {
      const navMobile = this.$refs.navMobile
      this.isOpenMenu = !this.isOpenMenu
      if (this.isOpenMenu) {
        navMobile.classList.remove('-translate-x-full')
        navMobile.classList.add('translate-x-0')
        document.body.classList.remove('overflow-auto')
        document.body.classList.add('overflow-hidden')
      } else {
        navMobile.classList.remove('translate-x-0')
        navMobile.classList.add('-translate-x-full')
        document.body.classList.remove('overflow-hidden')
        document.body.classList.add('overflow-auto')
      }
    },
    closeNav() {
      this.isOpenMenu = false
      const navMobile = document.querySelector('.nav-mobile');
      navMobile.classList.remove('translate-x-0')
      navMobile.classList.add('-translate-x-full')
      document.body.classList.remove('overflow-hidden')
      document.body.classList.add('overflow-auto')
    }
  }
}
</script>
