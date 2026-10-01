<template>
  <div class="w-full">
    <!-- The three.js canvas is fixed at z-0, above the opaque body background
         and below the content column (z-10). Only / and /about carry a scene;
         the component is lazy so blog routes never load three.js. One instance
         in the layout keeps the WebGL context alive across / <-> /about. -->
    <LazyVibeScene v-if="hasScene"/>
    <div class="relative z-10 max-w-3xl px-2 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
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
// Matched by route base name, not path: /en/about and /about are the same page.
const SCENE_ROUTE_NAMES = new Set(['index', 'about'])

const route = useRoute()
const getRouteBaseName = useRouteBaseName()
const hasScene = computed(() => SCENE_ROUTE_NAMES.has(String(getRouteBaseName(route) ?? '')))

// Set body attributes for theme styling
useHead({
  bodyAttrs: {
    class: 'bg-gray-50 dark:bg-gray-900'
  }
})
</script>
