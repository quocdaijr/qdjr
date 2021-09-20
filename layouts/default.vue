<template class="w-full">
  <div class="w-full">
    <div class="max-w-3xl px-2 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
      <div class="flex flex-col justify-between h-screen">
        <Header/>
        <main class="flex-grow font-medium text-gray-700">
          <Nuxt/>
        </main>
        <Footer/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    bodyAttrs: {
      class: 'bg-gray-50 dark:bg-gray-900'
    }
  }
}
</script>
<style>
/* home route and active route will show in bold as it matches / and /about */
.nuxt-link-active {
  @apply font-semibold;
}

/* exact link will show the primary color for only the exact matching link */
.nuxt-link-exact-active {
  @apply text-blue-600 dark:text-blue-300;
}
</style>
