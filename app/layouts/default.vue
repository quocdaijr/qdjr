<template>
  <div class="w-full">
    <!-- The three.js canvas is fixed at z-0, above the opaque body background
         and below the content column (z-10). In vibes mode every page carries
         the vibe scene (a trip page its own road); in cv mode only a trip page
         draws its road (utils/sceneMode.ts). One instance in the layout keeps
         the WebGL context alive across pages. It mounts — and its three.js
         chunk downloads — only once the page has loaded and gone idle, so the
         text paints and answers input first. -->
    <LazyVibeScene v-if="hasScene && sceneReady"/>
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
import {readDeviceTier, SCENE_SETTLE_MS} from '~/scenes/deviceTier'
import {useThemeStore} from '~/stores/theme'
import {hasSceneFor, readsOverSceneFor} from '~/utils/sceneMode'

// Clicks on 3D scene objects become navigation (see useSceneNavigation).
useSceneNavigation()

const store = useThemeStore()
const route = useRoute()
const getRouteBaseName = useRouteBaseName()
const routeName = computed(() => String(getRouteBaseName(route) ?? ''))
// Vibes mode: every page (design.md § Per-page allowances); cv mode: trip pages only.
const hasScene = computed(() => hasSceneFor(store.mode, routeName.value))
const sceneReady = ref(false)
let cancelScene = () => {}
onMounted(() => (cancelScene = whenIdle(() => (sceneReady.value = true), {settle: SCENE_SETTLE_MS[readDeviceTier()]})))
onBeforeUnmount(() => cancelScene())
const readOverScene = computed(() => readsOverSceneFor(store.mode, routeName.value))

// Set body attributes for theme styling
useHead({
  bodyAttrs: {
    class: 'bg-gray-50 dark:bg-gray-900'
  }
})
</script>
