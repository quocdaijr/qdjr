<template>
  <!-- The v3.0.0 home page (git show f7550c9:app/pages/index.vue), fed by the
       live profile. Its tsparticles background never rendered and is not back. -->
  <div class="h-full flex flex-col justify-center items-center text-gray-600 dark:text-gray-300">
    <div class="container mx-auto px-6 flex flex-col justify-between items-center py-4">
      <div class="flex flex-col">
        <img :src="content.profile.photo" :alt="content.profile.photoAlt" width="112" height="112" class="rounded-full w-28 mx-auto">
        <h1 class="text-6xl my-8 text-center">{{ t('home.hi', {name: content.profile.name}) }}</h1>
        <p class="py-4 text-center mx-auto">
          <span class="text-xl md:text-2xl font-bold">"{{ content.quote.text }}"</span>
          -
          <i class="font-normal text-base">"{{ content.quote.author }}"</i>
        </p>
        <div class="flex items-center justify-evenly mt-8">
          <NuxtLinkLocale v-for="link in LINKS" :key="link.to" :to="link.to" :class="BUTTON">{{ t(link.label) }}</NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'ClassicHome'})

const {t} = useI18n()
const content = useProfile()
const LINKS = [
  {to: '/about', label: 'home.moreInfo'},
  {to: '/blog', label: 'home.goToBlog'}
] as const
const BUTTON =
  'uppercase py-2 my-2 px-4 md:mt-16 bg-transparent text-md hover:text-gray-100 border-2 border-gray-600 dark:border-gray-300 hover:border-gray-600 dark:hover:border-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700'
</script>
