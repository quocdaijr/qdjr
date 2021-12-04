<template>
  <div class="h-full flex flex-col justify-center flex items-center text-gray-600 dark:text-gray-300">
    <div class="container mx-auto px-6 flex flex-col justify-between items-center py-4">
      <div class="flex flex-col">
        <img src="/profile.jpg" class="rounded-full w-28 mx-auto z-10"/>
        <p class="text-6xl my-8 text-center z-10">
          Hi, I'm Nguyen Quoc Dai 👋
        </p>
        <h2 class="py-4 z-10 text-center mx-auto">
          <span class="text-xl md:text-2xl font-bold">
            "First, solve the problem. Then, write the code"
          </span>
          -
          <i class="font-normal text-base"> "John Johnson"</i>
        </h2>
        <div class="flex items-center justify-evenly mt-8">
          <NuxtLink to="/about"
                    class="uppercase py-2 my-2 px-4 md:mt-16 bg-transparent text-md hover:text-gray-100
                    border-2 border-gray-600 dark:border-gray-300 hover:border-gray-600 dark:hover:border-gray-700
                    dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 z-10">
            More info
          </NuxtLink>
          <NuxtLink to="/blog"
                    class="uppercase py-2 my-2 px-4 md:mt-16 bg-transparent text-md hover:text-gray-100
                    border-2 border-gray-600 dark:border-gray-300 hover:border-gray-600 dark:hover:border-gray-700
                    dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 z-10">
            Go to my blog
          </NuxtLink>
        </div>
      </div>
    </div>
    <client-only>
      <vue-particles color="#dedede" class="absolute left-0 top-0 h-full w-full" style="z-index: -1"/>
    </client-only>
  </div>
</template>

<script>
export default {}
</script>
