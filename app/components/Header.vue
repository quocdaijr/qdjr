<template>
  <header class="sm:px-4 py-4 lg:px-8 lg:py-6">
    <div class="hidden md:flex items-center justify-between max-w-(--breakpoint-lg) mx-auto">
      <div class="w-1/12 flex justify-start">
        <NuxtLinkLocale to="/" class="inline-block mb-1 hover:scale-125">
          <span class="sr-only">{{ $t('nav.home') }}</span>
          <img class="w-10 pt-2" :src="logoSrc" alt="QDJr">
        </NuxtLinkLocale>
      </div>
      <!-- The nav keeps its natural width (labels differ per language); search takes the rest. -->
      <PostSearch class="flex-1 min-w-0 mx-4"/>
      <NavBar class="shrink-0" device="pc" :categories="categories"/>
      <div class="w-1/12 flex justify-end">
        <VibeSwitch variant="icon"/>
      </div>
    </div>
    <div class="md:hidden flex items-center max-w-(--breakpoint-lg) mx-auto">
      <div v-click-outside="closeNav" class="w-2/12 flex justify-center">
        <button
          type="button"
          class="w-10 h-10 ml-1 mr-1 rounded"
          :aria-label="$t('nav.toggleMenu')"
          aria-controls="mobile-nav"
          :aria-expanded="isOpenMenu"
          @click="toggleNav"
        >
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
          id="mobile-nav"
          class="nav-mobile fixed w-11/12 h-full rounded-r-lg top-14 left-0 bg-gray-200 dark:bg-gray-800 z-50 opacity-95 transform transition-transform ease-in-out duration-300"
          :class="isOpenMenu ? 'translate-x-0' : '-translate-x-full invisible'">
          <NavBar device="mobile" :method-toggle-nav="closeNav" :categories="categories"/>
        </div>
      </div>
      <PostSearch class="w-6/12 h-10"/>
      <div class="w-2/12 flex justify-end">
        <VibeSwitch variant="icon"/>
      </div>
      <div class="w-2/12 flex justify-end">
        <NuxtLinkLocale to="/" class="inline-block hover:scale-125">
          <span class="sr-only">{{ $t('nav.home') }}</span>
          <img class="w-10" :src="logoSrc" alt="QDJr">
        </NuxtLinkLocale>
      </div>
    </div>
  </header>
</template>

<script>
import NavBar from "~/components/NavBar";
import PostSearch from "~/components/post/Search";

export default {
  name: "Header",
  components: {PostSearch, NavBar},
  data() {
    return {
      isOpenMenu: false,
      categories: null
    }
  },
  computed: {
    themeStore() {
      return useThemeStore()
    },
    logoSrc() {
      // Fallback to light logo if theme store isn't initialized
      return this.themeStore?.logoSrc || '/logo.svg'
    }
  },
  // TODO: Implement categories fetching with Pinia store
  // async fetch() {
  //   const categoriesStore = useCategoriesStore()
  //   await categoriesStore.getCategories()
  //   this.categories = categoriesStore.categories || []
  // },
  watch: {
    isOpenMenu(isOpen) {
      // Lock background scrolling while the drawer is open. Set the inline style rather than
      // a body class: useHead({ bodyAttrs: { class } }) in layouts/default.vue rewrites the
      // body class attribute and would drop it.
      document.body.style.overflow = isOpen ? 'hidden' : ''
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  },
  methods: {
    toggleNav() {
      this.isOpenMenu = !this.isOpenMenu
    },
    closeNav() {
      this.isOpenMenu = false
    }
  }
}
</script>
