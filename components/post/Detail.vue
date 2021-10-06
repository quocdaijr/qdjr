<template>
  <div v-if="post" class="pb-8 px-2 my-12 border-b md:col-span-3 border-gray-200 dark:border-gray-600">

    <div class="w-full px-4 md:px-6 text-xl text-gray-800 leading-normal" style="font-family:Georgia,serif;">

      <!--Title-->
      <div class="font-sans">
        <p class="mb-8 text-sm text-right font-bold text-gray-600 dark:text-gray-300">Published
          <span>{{ $dayjs(post.published_at).fromNow() }}</span></p>
        <h1 class="pb-6 font-semibold break-normal text-gray-700 text-lg md:text-xl dark:text-gray-200">
          {{ post.description }}</h1>
      </div>
      <article class="text-gray-700 dark:text-gray-200" v-html="this.content"></article>
    </div>

    <!--Tags -->
    <div v-if="post.tags.length" class="md:text-sm text-gray-500 mt-6">
      <div v-for="tag in post.tags" :key="tag.id"
           class="text-xs inline-flex items-center border font-bold leading-sm
           px-3 py-1 mr-1 rounded-full bg-green-200 text-green-700 border-green-600
           dark:bg-green-800 dark:text-green-300 dark:border-green-500"
      >
        <NuxtLink :to="`/tag/${tag.id}`" class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span class="h-6 pl-1 pt-1 mb-1 text-sm no-underline hover:underline">{{ tag.name }}</span>
        </NuxtLink>
      </div>

    </div>

    <!--Author-->
    <div class="flex flex-row-reverse w-full items-center font-sans px-4 py-8 text-gray-700 dark:text-gray-200">
      <div
        class="m-1 w-12 h-12 relative flex justify-center items-center uppercase rounded-full text-xl text-white bg-yellow-500 dark:bg-yellow-600"
      >
        <b v-text="post.author ? post.author.toUpperCase().charAt(0) : '?'"></b>
      </div>
      <div class="flex-1 text-right">
        <p class="text-base font-bold text-base md:text-xl leading-none mb-2" v-text="post.author || 'Unknown'"></p>
        <p class="text-xs md:text-base">Hi!</p>
      </div>
      <div class="justify-end">
        <p class="text-base md:text-md leading-none mb-2 mt-1">
          <span class="font-bold underline">Nguồn:</span> <span v-text="post.source || 'Unknown'"></span>
        </p>
        <p class="text-base md:text-md leading-none mb-2 mt-1">
          <span class="font-bold underline">Địa điểm:</span> <span v-text="post.location || 'Unknown'"></span>
        </p>
      </div>
    </div>
  </div>
  <div v-else>Page Not Found</div>
</template>

<script>
import Prism from '~/plugins/prism'

export default {
  name: "PostDetail",
  props: {
    post: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      content: ''
    }
  },
  created() {
    if (this.post.content) {
      const imgTagRegex = /<img(.*?)src="((http|https)+:\/\/(.*?)\/)(.*?)(\/.*?[^"])"(.*?)\/>/gm;
      this.content = this.post.content.replace(imgTagRegex, `<img $1 src="$2i/720p$6"$7/>`);
    }
  },
  mounted() {
    Prism.highlightAll()
  }
}
</script>