<template>
  <!-- The v3.0.0 about page (git show f7550c9:app/pages/about/index.vue): a
       sticky identity column beside stacked cards. The old page hardcoded its
       English text; this one reads the live, bilingual profile. -->
  <div class="classic-about pt-8 items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
    <aside class="flex flex-col items-center text-center text-gray-600 dark:text-gray-300 xl:sticky xl:top-8 xl:self-start">
      <img
        :src="content.profile.photo"
        :alt="content.profile.photoAlt"
        width="192"
        height="192"
        class="w-48 h-48 rounded-full hover:scale-105"
      >
      <h1 class="pt-4 pb-2 text-3xl font-bold leading-8 tracking-tight">{{ content.profile.displayName }}</h1>
      <p class="font-bold p-1">{{ content.profile.role }}</p>
      <p class="classic-summary text-sm font-medium text-justify bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
        <b>{{ t('cv.summary') }}:</b> {{ content.profile.summary }}
      </p>
      <section :class="[CARD, 'w-full text-left']">
        <h2 :class="CARD_TITLE">{{ t('cv.contact') }}</h2>
        <SocialLinks size="lg" class="justify-center pt-3"/>
        <dl class="text-sm">
          <div v-for="row in content.contact" :key="row.label" class="grid grid-cols-3">
            <dt class="px-4 py-2 font-semibold">{{ row.label }}</dt>
            <dd class="col-span-2 px-4 py-2 min-w-0 wrap-break-word">
              <a v-if="row.href" :href="row.href" class="text-blue-600 dark:text-blue-400">{{ row.value }}</a>
              <template v-else>{{ row.value }}</template>
            </dd>
          </div>
        </dl>
      </section>
    </aside>

    <div class="pb-8 max-w-none xl:col-span-2 text-gray-600 dark:text-gray-300">
      <section :class="CARD">
        <h2 :class="CARD_TITLE">{{ t('cv.skills') }}</h2>
        <ul class="divide-y text-sm pl-2">
          <li v-for="skill in content.skills" :key="skill.group" class="py-3">
            <b>{{ skill.group }}</b>
            <p v-if="skill.expert">
              <span class="text-blue-600 dark:text-blue-400 font-medium">{{ t('about.expert') }}:</span> {{ skill.expert }}
            </p>
            <p v-if="skill.proficient">
              <span class="text-green-800 dark:text-green-400 font-medium">{{ t('about.proficient') }}:</span> {{ skill.proficient }}
            </p>
            <p v-if="skill.note">{{ skill.note }}</p>
          </li>
        </ul>
      </section>

      <section :class="CARD">
        <h2 :class="CARD_TITLE">{{ t('cv.more') }}</h2>
        <ul class="divide-y text-sm pl-2">
          <li v-for="item in content.otherSkills" :key="item.label" class="py-3"><b>{{ item.label }}:</b> {{ item.text }}</li>
        </ul>
      </section>

      <section :class="CARD">
        <h2 :class="CARD_TITLE">{{ t('cv.education') }} &amp; {{ t('cv.experience') }}</h2>
        <!-- A centre bar from sm up, cards alternating left and right of it. -->
        <ol class="classic-timeline relative pt-4 text-sm text-gray-700 dark:text-gray-300">
          <li class="hidden sm:block w-1 bg-blue-500 dark:bg-blue-400 absolute h-full left-1/2 -translate-x-1/2" aria-hidden="true"></li>
          <li
            v-for="(entry, i) in content.timeline"
            :key="entry.period + entry.org"
            class="mt-6 sm:mt-0 sm:mb-12 flex w-full"
            :class="i % 2 ? 'justify-end' : 'justify-start'"
          >
            <div class="w-full sm:w-[calc(50%-2rem)] p-4 rounded shadow bg-gray-200 dark:bg-gray-700">
              <i class="text-base font-semibold">{{ entry.period }}</i>
              <p class="pt-4 font-semibold">{{ entry.org }}</p>
              <p v-if="entry.position">{{ entry.position }}</p>
              <p v-else-if="entry.major">{{ entry.major }} · {{ entry.degree }}</p>
              <ul class="pt-2">
                <li v-for="line in entry.achievements" :key="line">- {{ line }}</li>
              </ul>
              <p v-if="entry.technologies" class="pt-2"><b>{{ t('about.technologies') }}:</b> {{ entry.technologies }}</p>
              <p v-if="entry.thirdParties"><b>{{ t('about.thirdParties') }}:</b> {{ entry.thirdParties }}</p>
            </div>
          </li>
        </ol>
      </section>

      <section :class="CARD">
        <h2 :class="CARD_TITLE">{{ t('cv.projects') }}</h2>
        <ul class="classic-projects divide-y text-sm pl-2">
          <li v-for="project in content.projects" :key="project.name" class="py-3 flex items-start space-x-3">
            <img :src="project.image" :alt="project.alt" width="48" height="48" loading="lazy" class="w-12 h-12 object-contain rounded shrink-0">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-semibold text-base">{{ project.name }}</h3>
                <a
                  v-if="project.url"
                  :href="project.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="shrink-0 text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                >{{ t('about.visitLive') }}</a>
              </div>
              <p class="text-gray-700 dark:text-gray-300">{{ project.description }}</p>
              <p>
                <span class="font-medium text-green-800 dark:text-green-400">{{ t('about.position') }}:</span> {{ project.role }}
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'ClassicAbout'})

const {t} = useI18n()
const content = useProfile()
const CARD = 'mt-3 p-2 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800'
const CARD_TITLE = 'font-semibold leading-8 tracking-wide'
</script>
