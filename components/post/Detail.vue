<template>
  <div v-if="post" class="flex pb-8 px-2 my-12 border-b md:col-span-3 border-gray-200 dark:border-gray-600 w-full">
    <div class="block z-10 fixed right-2 sm:relative sm:right-0">
      <social/>
    </div>
    <div class="w-11/12 flex-grow">
      <div class="w-full px-4 md:px-6 text-xl text-gray-800 leading-normal">
        <!--Title-->
        <div class="md:flex md:justify-between items-center mb-8 font-bold">
        <span class="flex items-center text-right text-gray-700 dark:text-gray-200">
          <NuxtLink :to="`/category/${post.categories[0].slug || 0}`" class="flex items-center">
            <svg v-if="!post.categories[0].thumbnail" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-1"
                 fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
            </svg>
            <img v-if="post.categories[0].thumbnail" class="h-6 w-6 mr-1"
                 :src="$urlResize(post.categories[0].thumbnail, '240p')"
                 :alt="post.categories[0].name">
            {{ post.categories[0].name || 'Unknown' }}
          </NuxtLink>
        </span>
          <span class="text-sm text-gray-600 dark:text-gray-300">
          Published <span>{{ $dayjs(post.published_at).fromNow() }}</span>
        </span>
        </div>
        <div class="my-4">
          <h1 class="pb-6 font-semibold break-normal text-gray-700 text-lg md:text-xl dark:text-gray-200">
            {{ post.description }}
          </h1>
        </div>
        <article class="text-gray-700 dark:text-gray-200 pb-8" v-html="content"/>
        <hr class="w-60 mx-auto text-gray-200 dark:text-gray-600">
      </div>

      <!--Tags -->
      <div v-if="post.tags" class="md:text-sm text-gray-500 mt-6">
        <div v-for="tag in post.tags" :key="tag.id"
             class="text-xs inline-flex items-center font-bold leading-sm px-3 py-1 mr-1 rounded-full
            bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        >
          <NuxtLink :to="`/tag/${tag.slug}`" class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
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
  </div>
  <div v-else>Page Not Found</div>
</template>

<script>
import Social from "~/components/Social"
import Prism from '~/plugins/prism'
import videojs from '~/plugins/videojs'

export default {
  name: "PostDetail",
  components: {Social},
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
      const imgTagRegex = /<img(.*?)src="((http|https)+:\/\/(.*?))(\/r\/)(.*?[^"])"(.*?)\/>/gm;
      this.content = this.post.content.replace(imgTagRegex, `<img $1 src="$2/i/720p/$6"$7/>`);
    }
  },
  mounted() {
    Prism.highlightAll()
    const videoElements = document.querySelectorAll('.video-import')
    if (videoElements) {
      videoElements.forEach(videoElement => {
        videoElement.classList.add('video-js')
        videoElement.classList.add('vjs-default-skin')
        videoElement.classList.add('mx-auto')
        videoElement.removeAttribute('width')
        videoElement.removeAttribute('height')
        videojs(videoElement, {
          preload: "auto",
          playbackRates: [0.5, 1, 1.5, 2]
        })
      })
    }
  }
}
</script>
