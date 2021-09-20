<template>
  <div v-if="post" class="pb-8 px-2 my-12 border-b md:col-span-3 border-gray-200 dark:border-gray-600">

    <div class="w-full px-4 md:px-6 text-xl text-gray-800 leading-normal" style="font-family:Georgia,serif;">

      <!--Title-->
      <div class="font-sans">
        <p class="mb-8 text-sm text-right font-bold text-gray-600 dark:text-gray-300">Published <span>{{ $dayjs(post.published_at).fromNow() }}</span></p>
        <h1 class="pb-6 font-semibold break-normal text-gray-700 text-lg md:text-xl dark:text-gray-200">{{ post.description }}</h1>
      </div>
      <article class="text-gray-700 dark:text-gray-100" v-html="post.content">{{ post.content || "No content" }}</article>
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

    <!--      &lt;!&ndash;Divider&ndash;&gt;-->
    <!--      <hr class="border-b-2 border-gray-400 mb-8 mx-4">-->


    <!--      &lt;!&ndash;Subscribe&ndash;&gt;-->
    <!--      <div class="container px-4">-->
    <!--        <div class="font-sans bg-gradient-to-b from-green-100 to-gray-100 rounded-lg shadow-xl p-4 text-center">-->
    <!--          <h2 class="font-bold break-normal text-xl md:text-3xl">Subscribe to my Newsletter</h2>-->
    <!--          <h3 class="font-bold break-normal text-gray-600 text-sm md:text-base">Get the latest posts delivered right to your inbox</h3>-->
    <!--          <div class="w-full text-center pt-4">-->
    <!--            <form action="#">-->
    <!--              <div class="max-w-xl mx-auto p-1 pr-0 flex flex-wrap items-center">-->
    <!--                <input type="email" placeholder="youremail@example.com" class="flex-1 mt-4 appearance-none border border-gray-400 rounded shadow-md p-3 text-gray-600 mr-2 focus:outline-none">-->
    <!--                <button type="submit" class="flex-1 mt-4 block md:inline-block appearance-none bg-green-500 text-white text-base font-semibold tracking-wider uppercase py-4 rounded shadow hover:bg-green-400">Subscribe</button>-->
    <!--              </div>-->
    <!--            </form>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      &lt;!&ndash; /Subscribe&ndash;&gt;-->


    <!--      &lt;!&ndash;Author&ndash;&gt;-->
    <!--      <div class="flex w-full items-center font-sans px-4 py-12">-->
    <!--        <img class="w-10 h-10 rounded-full mr-4" src="http://i.pravatar.cc/300" alt="Avatar of Author">-->
    <!--        <div class="flex-1 px-2">-->
    <!--          <p class="text-base font-bold text-base md:text-xl leading-none mb-2">Jo Bloggerson</p>-->
    <!--          <p class="text-gray-600 text-xs md:text-base">Minimal Blog Tailwind CSS template by <a class="text-green-500 no-underline hover:underline" href="https://www.tailwindtoolbox.com">TailwindToolbox.com</a></p>-->
    <!--        </div>-->
    <!--        <div class="justify-end">-->
    <!--          <button class="bg-transparent border border-gray-500 hover:border-green-500 text-xs text-gray-500 hover:text-green-500 font-bold py-2 px-4 rounded-full">Read More</button>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--      &lt;!&ndash;/Author&ndash;&gt;-->

    <!--      &lt;!&ndash;Divider&ndash;&gt;-->
    <!--      <hr class="border-b-2 border-gray-400 mb-8 mx-4">-->

    <!--      &lt;!&ndash;Next & Prev Links&ndash;&gt;-->
    <!--      <div class="font-sans flex justify-between content-center px-4 pb-12">-->
    <!--        <div class="text-left">-->
    <!--          <span class="text-xs md:text-sm font-normal text-gray-600">&lt; Previous Post</span><br>-->
    <!--          <p><a href="#" class="break-normal text-base md:text-sm text-green-500 font-bold no-underline hover:underline">Blog title</a></p>-->
    <!--        </div>-->
    <!--        <div class="text-right">-->
    <!--          <span class="text-xs md:text-sm font-normal text-gray-600">Next Post &gt;</span><br>-->
    <!--          <p><a href="#" class="break-normal text-base md:text-sm text-green-500 font-bold no-underline hover:underline">Blog title</a></p>-->
    <!--        </div>-->
    <!--      </div>-->


    <!--      &lt;!&ndash;/Next & Prev Links&ndash;&gt;-->
  </div>
  <div v-else>Page Not Found</div>
</template>

<script>
// import {mapState} from "vuex"
export default {
  name: "PostDetail",
  props: {
    post: {
      type: Object,
      required: true,
    }
  }
}
</script>
