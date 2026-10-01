<template>
  <div class="w-full">
    <HeaderContent :title="t('blog.title')" :description="t('blog.description')"/>

    <section v-if="status === 'pending'" class="flex flex-col items-center my-10 text-2xl text-gray-500 dark:text-gray-300">
      <span class="text-gray-500 pt-2">{{ t('blog.loading') }}</span>
    </section>

    <section v-else-if="!posts || !posts.length"
             class="flex flex-col items-center my-10 text-center text-2xl text-gray-500 dark:text-gray-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z"/>
        <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z"
              clip-rule="evenodd"/>
      </svg>
      <span class="text-gray-500 pt-2">{{ t('blog.empty') }}</span>
    </section>

    <section v-else class="py-10 text-gray-500 dark:text-gray-300">
      <article v-for="post in posts" :key="post.path" :lang="post.originalOnly ? 'vi' : undefined"
               class="max-w-(--breakpoint-lg) mx-auto md:grid md:grid-cols-4">
        <div class="md:col-span-1 md:pr-12 lg:pr-16">
          <div class="relative h-full pb-4 md:border-r md:pb-0 md:pt-2">
            <div class="md:text-right md:pr-10">
              <span class="inline-block pt-1 pl-2 font-medium border-l-4 border-teal-600 md:font-normal md:border-l-0 md:pl-0">
                {{ formatPostDate(post.publishedAt, locale) }}
              </span>
              <span class="items-center justify-center hidden w-8 h-8 bg-teal-500 rounded-full text-teal-50 md:inline-flex md:absolute md:-right-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div class="pb-8 mb-12 border-b md:col-span-3">
          <div class="prose md:prose-lg dark:prose-invert">
            <img v-if="post.thumbnail" :src="post.thumbnail" :alt="post.title" class="rounded-lg">
            <h2 class="text-xl font-semibold py-4">{{ post.title }}</h2>
            <PostTranslationBadge :post="post"/>
            <i v-if="post.description" class="block text-sm font-normal">{{ post.description }}</i>
            <div v-if="post.tags && post.tags.length" class="mt-3 text-xs">
              <NuxtLinkLocale v-for="tag in post.tags" :key="tag" :to="`/blog/tag/${tag}`"
                        class="inline-block mr-2 mb-1 px-2 py-0.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200">
                #{{ tag }}
              </NuxtLinkLocale>
            </div>
            <div class="mt-4">
              <NuxtLinkLocale :to="post.path"
                        class="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {{ t('blog.readMore') }}&nbsp;
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clip-rule="evenodd"/>
                </svg>
              </NuxtLinkLocale>
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
const {t, locale} = useI18n()

useHead(() => ({title: t('blog.metaTitle')}))
useSeoMeta({
  title: () => t('blog.metaTitle'),
  description: () => t('blog.description'),
  ogType: 'website'
})

const {data: posts, status} = await useAsyncData(`blog-list-${locale.value}`, () => fetchBlogPosts(locale.value))
</script>
