<template>
  <section v-if="$fetchState.pending"
           class="flex flex-col items-center my-10 text-2xl text-gray-500 dark:text-gray-300">
    <DotLoader class="mx-auto" color="#9CA3AF"/>
    <span class="text-gray-400 pt-2">Please waiting...</span>
  </section>
  <section v-else-if="$fetchState.error !== null"
           class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"/>
    </svg>
    <span class="text-gray-400 pt-2">Something went wrong during get data :)))</span>
  </section>
  <section v-else-if="getError !== null"
           class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"/>
    </svg>
    <span class="text-gray-400 pt-2">Something went wrong with my API :)))</span>
  </section>
  <section v-else-if="getPosts.length" class="py-10 text-gray-500 dark:text-gray-300">
    <div v-for="post in getPosts" :key="post.id" class="max-w-screen-lg mx-auto md:grid md:grid-cols-4">
      <div class="md:col-span-1 md:pr-12 lg:pr-16">
        <div class="relative h-full pb-4 md:border-r md:pb-0 md:pt-2">
          <div class="md:text-right md:pr-10">
                <span
                  class="inline-block pt-1 pl-2 font-medium border-l-4 border-teal-600 md:font-normal md:border-l-0 md:pl-0">
                  {{ $dayjs(post.published_at).fromNow() }}
                </span>
            <span
              class="items-center justify-center hidden w-8 h-8 bg-teal-500 rounded-full text-teal-50 md:inline-flex md:absolute md:-right-4">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                 </svg>
                </span>
          </div>
        </div>
      </div>
      <div class="pb-8 mb-12 border-b md:col-span-3">
        <div class="prose md:prose-lg">
          <img :src="$urlResize(post.thumbnail || '', '480p')" :alt="post.title" class="rounded-lg">
          <h2 class="text-xl font-semibold py-4">{{ post.title }}</h2>
          <i class="text-sm font-normal">{{ post.description }}</i>
          <div class="mt-4">
            <NuxtLink :to="`/${post.slug}`"
                      class="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >Read more&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clip-rule="evenodd"/>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div v-for="postMore in (getPostsMore || [])" :key="postMore.id"
         class="max-w-screen-lg mx-auto md:grid md:grid-cols-4">
      <div class="md:col-span-1 md:pr-12 lg:pr-16">
        <div class="relative h-full pb-4 md:border-r md:pb-0 md:pt-2">
          <div class="md:text-right md:pr-10">
                <span
                  class="inline-block pt-1 pl-2 font-medium border-l-4 border-teal-600 md:font-normal md:border-l-0 md:pl-0">
                  {{ $dayjs(postMore.published_at).fromNow() }}
                </span>
            <span
              class="items-center justify-center hidden w-8 h-8 bg-teal-500 rounded-full text-teal-50 md:inline-flex md:absolute md:-right-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                 </svg>
                </span>
          </div>
        </div>
      </div>
      <div class="pb-8 mb-12 border-b md:col-span-3">
        <div class="prose md:prose-lg">
          <img :src="$urlResize(postMore.thumbnail || '', '480p')" :alt="postsMore.title" class="rounded-lg">
          <h2 class="text-xl font-semibold py-4">{{ postMore.title }}</h2>
          <i class="text-sm font-normal">{{ postMore.description }}</i>
          <div class="mt-4">
            <NuxtLink :to="`/${postMore.slug}`"
                      class="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >Read more&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clip-rule="evenodd"/>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div v-if="getCount > 0" class="w-full">
      <div class="w-16 h-16 mx-auto cursor-pointer"
           @click="loadMore">
        <svg xmlns="http://www.w3.org/2000/svg" class="animate-bounce h-16 w-16 pt-4 pl-4 text-gray-500"
             viewBox="0 0 20 20"
             fill="currentColor">
          <path fill-rule="evenodd"
                d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0zm0 6a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L10 14.586l4.293-4.293a1 1 0 011.414 0z"
                clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
  </section>
  <section v-else class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z"/>
      <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
            clip-rule="evenodd"/>
    </svg>
    <span class="text-gray-400 pt-2">No data</span>
  </section>
</template>

<script>
import DotLoader from "vue-spinner/src/DotLoader.vue"

export default {
  name: "PostList",
  components: {
    DotLoader
  },
  props: {
    listType: {
      type: String,
      default: 'normal'
    },
    extraValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      posts: [],
      postsMore: [],
      count: 0,
      page: 1,
      perPage: 5
    }
  },
  async fetch() {
    const params = {
      page: this.page,
      perPage: this.perPage,
    }
    switch (this.listType) {
      case 'byTag':
        params.tag = this.extraValue
        break;
      case 'byCategory':
        params.category = this.extraValue
        break;
      case 'bySearch':
        params.txt = this.extraValue
        break;
      default:
        break;
    }
    await this.$store.dispatch("posts/getPosts", params)
    this.posts = this.$store.state.posts.posts || []
  },
  computed: {
    getPosts() {
      return this.$store.state.posts.posts
    },
    getCount() {
      return this.$store.state.posts.count
    },
    getError() {
      return this.$store.state.posts.error
    },
    getPostsMore() {
      return this.$store.state.posts.postsMore
    }
  },
  methods: {
    loadMore() {
      const params = {
        page: ++this.page,
        perPage: this.perPage,
        isLoadMore: true
      }
      switch (this.listType) {
        case 'byTag':
          params.tag = this.$route.params.id
          break;
        case 'byCategory':
          params.catergory = this.$route.params.id
          break;
        case 'bySearch':
          params.txt = this.$route.query.txt
          break;
        default:
          break;
      }
      this.$store.dispatch("posts/getPosts", params)
    }
  }
}
</script>
