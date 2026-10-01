<template>
  <!-- footer -->
  <footer>
    <div class="flex flex-col justify-center items-center mt-16 text-sm text-gray-600 dark:text-gray-300">
      <SocialLinks size="sm" class="mb-3"/>
      <Clock />
      <div class="flex mb-2 space-x-2">
        <div class="flex items-center">
          <span>{{ $t('footer.madeWith') }}&nbsp;</span>
          <span>
            &nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clip-rule="evenodd" />
            </svg>
            &nbsp;
          </span>
          <span>&nbsp;{{ $t('footer.by') }}</span>
        </div>
      </div>
      <!--      <div class="mb-8 text-sm text-gray-500 dark:text-gray-300">-->
      <!--        Design inherited from-->
      <!--        <a class="text-blue-500 dark:text-blue-400" target="_blank" rel="noopener noreferrer"-->
      <!--           href="https://github.com/tailwindlabs/blog.tailwindcss.com">Tailwind Blog</a>-->
      <!--      </div>-->
    </div>
    <a ref="scrollToTop" role="button" :aria-label="$t('footer.scrollTop')"
      class="animate-bounce fixed right-8 bottom-10 text-gray-100 bg-gray-700 p-1 opacity-80 dark:bg-gray-300 dark:text-gray-600 cursor-pointer hidden"
      @click="scrollTop">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 sm:h-10 sm:w-10" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
          clip-rule="evenodd" />
      </svg>
    </a>
  </footer>
  <!--/ footer -->
</template>

<script>
import Clock from "~/components/Clock"

export default {
  name: "Footer",
  components: { Clock },
  mounted() {
    this.$nextTick(function () {
      const scrollToTop = this.$refs.scrollToTop
      window.addEventListener('scroll', function () {
        if (window.scrollY > 150)
          scrollToTop.classList.remove('hidden')
        else
          scrollToTop.classList.add('hidden')
      })
    })
  },
  methods: {
    scrollTop() {
      // Native smooth scroll; the old setInterval stepper never cleared itself
      // when the user scrolled during the animation.
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }
}
</script>
