<template>
  <div class="h-full">
    <HeaderContent v-if="post" :title="post.title" :background="post.cover || ''"/>

    <div v-if="post"
         class="flex pb-8 px-1 sm:px-2 my-12 border-b md:col-span-3 border-gray-200 dark:border-gray-600 w-full max-w-(--breakpoint-lg) mx-auto">
      <div class="w-full grow text-base">
        <div class="w-full sm:px-3 text-gray-800 dark:text-gray-200 leading-normal">
          <PostTranslationNotice :post="post"/>

          <div class="md:flex md:justify-between items-center mb-8 font-bold">
            <span v-if="post.category" class="flex items-center text-right text-gray-700 dark:text-gray-200">
              <NuxtLinkLocale :to="`/blog/category/${post.category}`" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
                <span>{{ post.category }}</span>
              </NuxtLinkLocale>
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-300">
              {{ t('blog.published', {date: formatPostDate(post.publishedAt, locale, 'long')}) }}
            </span>
          </div>

          <div v-if="post.description" class="my-4" :lang="articleLang">
            <p class="pb-6 font-semibold break-normal text-gray-700 text-lg md:text-xl dark:text-gray-200">
              {{ post.description }}
            </p>
          </div>

          <article class="prose md:prose-lg max-w-none dark:prose-invert text-gray-700 dark:text-gray-200 pb-8" :lang="articleLang">
            <ContentRenderer :value="post"/>
          </article>

          <hr class="w-60 mx-auto text-gray-200 dark:text-gray-600">
        </div>

        <div v-if="post.tags && post.tags.length" class="text-gray-500 mt-6">
          <NuxtLinkLocale v-for="tag in post.tags" :key="tag" :to="`/blog/tag/${tag}`"
                    class="inline-flex items-center font-bold leading-sm px-3 py-1 mr-1 rounded-full
                           bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <span class="h-6 pl-1 pt-1 mb-1 text-sm">{{ tag }}</span>
          </NuxtLinkLocale>
        </div>

        <div v-if="post.author" class="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
          <div class="w-12 h-12 flex justify-center items-center uppercase rounded-full text-xl text-white bg-yellow-500 dark:bg-yellow-600 shrink-0">
            <b>{{ post.author.charAt(0).toUpperCase() }}</b>
          </div>
          <div>
            <p class="text-base font-semibold md:text-lg leading-tight">{{ post.author }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ t('blog.author') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center my-20 text-2xl text-gray-500 dark:text-gray-300">
      <span>{{ t('blog.notFound') }}</span>
      <NuxtLinkLocale to="/blog" class="mt-4 text-base text-blue-600 hover:underline dark:text-blue-400">{{ t('blog.back') }}</NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const {t, locale} = useI18n()
const runtimeConfig = useRuntimeConfig()

// /en/blog/x and /blog/x both resolve to the content path /blog/x.
const contentPath = stripLocalePrefix(route.path.replace(/\/+$/, ''), locale.value)

const {data: post} = await useAsyncData(`blog-${locale.value}-${contentPath}`, () => fetchBlogPost(contentPath, locale.value))

if (!post.value) {
  throw createError({statusCode: 404, statusMessage: 'Page Not Found', fatal: true})
}

// The language of the text actually shown, for screen readers and hyphenation.
const articleLang = computed(() => (post.value?.originalOnly || locale.value === 'vi' ? 'vi' : 'en'))

const tagsStr = computed(() => (post.value?.tags || []).join(', '))
const fullUrl = computed(() => `${runtimeConfig.public.baseUrl}${route.path}`)
const fullTitle = computed(() => (post.value?.title ? `${post.value.title} | ${t('blog.siteSuffix')}` : t('blog.siteSuffix')))

useHead(() => ({
  title: fullTitle.value,
  // `keywords` is not a useSeoMeta key in Unhead v3; it belongs in raw meta.
  meta: [{name: 'keywords', content: tagsStr.value}]
}))

useSeoMeta({
  title: () => post.value?.title || '',
  description: () => post.value?.description || '',
  ogType: 'article',
  ogUrl: () => fullUrl.value,
  ogTitle: () => fullTitle.value,
  ogDescription: () => post.value?.description || '',
  ogImage: () => post.value?.cover || post.value?.thumbnail || '',
  articlePublishedTime: () => toIso(post.value?.publishedAt),
  articleModifiedTime: () => toIso(post.value?.updatedAt || post.value?.publishedAt),
  articleAuthor: () => (post.value?.author ? [post.value.author] : [])
})

function toIso(value: unknown): string {
  if (!value) return ''
  const d = new Date(value as string | number | Date)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}
</script>

<style>
/* Tailwind typography (`prose`) forces a dark-gray `pre` background that clashes
   with Shiki's github-light theme (dark tokens on a light bg). Reset pre styling
   and let Shiki's themed colors show through. */
.prose pre.shiki,
.prose :not(pre) > code {
  background-color: #fff;
  color: #24292e;
}

.prose :not(pre) > code {
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  font-size: 0.9em;
}

.prose :not(pre) > code::before,
.prose :not(pre) > code::after {
  content: '';
}

.prose pre.shiki {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}

.prose pre.shiki code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.9em;
}

html.dark .prose pre.shiki,
html.dark .prose :not(pre) > code {
  background-color: #0d1117;
  color: #e1e4e8;
  border-color: #30363d;
}
</style>
