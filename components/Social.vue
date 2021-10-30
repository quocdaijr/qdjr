<template>
  <div class="content-social sticky top-2">
    <button
      class="btn-share relative flex z-10 rounded-full p-2 shadow-lg bg-gray-50 dark:bg-gray-800 hover:scale-105">
      <svg xmlns="http://www.w3.org/2000/svg" class="icon-open-share h-8 w-8 text-blue-500 dark:text-blue-100"
           viewBox="0 0 20 20"
           fill="currentColor">
        <path
          d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="icon-close-share h-8 w-8 text-blue-500 dark:text-blue-100 hidden"
           viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"/>
      </svg>
    </button>
    <div
      class="dropdown-share absolute right-0 z-20 hidden pt-3">
      <a :href="'https://www.facebook.com/sharer/sharer.php?u=' + url" title="Share on Facebook" target="_blank"
         class="block rounded-full p-2 mb-1 shadow-lg bg-gray-50 dark:bg-gray-800 hover:scale-105">
        <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook-messenger"
             class="w-8 h-8 text-blue-500 dark:text-blue-100" role="img" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24">
          <path fill="currentColor"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a :href="'https://twitter.com/intent/tweet?text=' + url" title="Share on Twitter" target="_blank"
         class="block rounded-full p-2 mb-1 shadow-lg bg-gray-50 dark:bg-gray-800 hover:scale-105">
        <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter-square"
             class="w-8 h-8 text-blue-500 dark:text-blue-100" role="img" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 448 512">
          <path fill="currentColor"
                d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-48.9 158.8c.2 2.8.2 5.7.2 8.5 0 86.7-66 186.6-186.6 186.6-37.2 0-71.7-10.8-100.7-29.4 5.3.6 10.4.8 15.8.8 30.7 0 58.9-10.4 81.4-28-28.8-.6-53-19.5-61.3-45.5 10.1 1.5 19.2 1.5 29.6-1.2-30-6.1-52.5-32.5-52.5-64.4v-.8c8.7 4.9 18.9 7.9 29.6 8.3a65.447 65.447 0 0 1-29.2-54.6c0-12.2 3.2-23.4 8.9-33.1 32.3 39.8 80.8 65.8 135.2 68.6-9.3-44.5 24-80.6 64-80.6 18.9 0 35.9 7.9 47.9 20.7 14.8-2.8 29-8.3 41.6-15.8-4.9 15.2-15.2 28-28.8 36.1 13.2-1.4 26-5.1 37.8-10.2-8.9 13.1-20.1 24.7-32.9 34z"></path>
        </svg>
      </a>
      <a :href="'https://www.linkedin.com/sharing/share-offsite/?url=' + url" title="Share on LinkedIn" target="_blank"
         class="block rounded-full p-2 shadow-lg bg-gray-50 dark:bg-gray-800 hover:scale-105">
        <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin"
             class="w-8 h-8 text-blue-500 dark:text-blue-100" role="img" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 448 512">
          <path fill="currentColor"
                d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path>
        </svg>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Social",
  computed: {
    url() {
      return process.env.baseUrl + this.$route.path
    }
  },
}
</script>

<style scoped>
.btn-share:hover .dropdown-share,
.btn-share:hover .icon-close-share,
.content-social:hover .icon-close-share,
.content-social:hover .dropdown-share {
  display: block;
}

.btn-share:hover .icon-open-share,
.content-social:hover .icon-open-share {
  display: none;
}
</style>
