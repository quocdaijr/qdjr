<template>
  <div class="w-full">
    <!-- The three.js canvas is fixed at z-0, above the opaque body background
         and below the content column (z-10). Every page carries the vibe scene
         (a trip page its own road). One instance in the layout keeps the
         WebGL context alive across pages. -->
    <LazyVibeScene v-if="hasScene"/>
    <!-- Pages without panels of their own read straight over the scene, as on /: a full-screen veil softens and blurs it behind the text. -->
    <div v-if="readOverScene" class="scene-veil" aria-hidden="true"></div>
    <div class="relative z-10 max-w-3xl px-2 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
      <div class="flex flex-col justify-between min-h-screen">
        <Header/>
        <main class="grow font-medium text-gray-700" :class="{'reads-over-scene': readOverScene}">
          <slot />
        </main>
        <Footer/>
      </div>
    </div>
  </div>
</template>

<script setup>
// Matched by route base name, not path: /en/about and /about are the same page.
// Pages laid out over the scene on purpose (their own panels); every other page reads over a veiled scene.
const SCENE_PAGE_NAMES = new Set(['index', 'about', 'trips-slug', 'trips-plan'])

// Clicks on 3D scene objects become navigation (see useSceneNavigation).
useSceneNavigation()

const route = useRoute()
const getRouteBaseName = useRouteBaseName()
const routeName = computed(() => String(getRouteBaseName(route) ?? ''))
const hasScene = true // every page, see design.md § Per-page allowances
const readOverScene = computed(() => !SCENE_PAGE_NAMES.has(routeName.value))

// Set body attributes for theme styling
useHead({
  bodyAttrs: {
    class: 'bg-gray-50 dark:bg-gray-900'
  }
})
</script>
