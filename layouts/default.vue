<template class="w-full">
  <div class="w-full">
    <div class="max-w-3xl px-2 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
      <div class="flex flex-col justify-between h-screen">
        <Header/>
        <main class="flex-grow font-medium text-gray-700">
          <NuxtPage/>
        </main>
        <Footer/>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set body attributes for theme styling
useHead({
  bodyAttrs: {
    class: 'bg-gray-50 dark:bg-gray-900'
  }
})
</script>
<style>
/* home route and active route will show in bold as it matches / and /about */
.nuxt-link-active {
  @apply font-semibold;
}

/* exact link will show the primary color for only the exact matching link */
.nuxt-link-exact-active {
  @apply text-blue-600 dark:text-blue-400;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  -webkit-border-radius: 5px;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: #6d6d6d;
}

/* Disable background color when press link, button,... */
* {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>
