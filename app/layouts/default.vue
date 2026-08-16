<template class="w-full">
  <div class="w-full">
    <div class="max-w-3xl px-2 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
      <div class="flex flex-col justify-between h-screen">
        <Header/>
        <main class="grow font-medium text-gray-700">
          <slot />
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
