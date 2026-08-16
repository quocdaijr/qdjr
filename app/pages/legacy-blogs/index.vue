<template>
  <div class="w-full">
    <HeaderContent title="Legacy Blog" description="Archived posts from the old API-backed blog."/>
    <TagListNewest class="justify-end mb-4"/>
    <PostList/>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'LegacyBlogIndex'})

// The "Will be back soon 🥲" placeholder is gone: PostList and TagListNewest
// crashed on render because $dayjs was never provided and $fetchState is a Nuxt
// 2 API. Both are fixed, and PostList now owns the offline state itself, so this
// page degrades correctly whether or not API_URL is set.
useHead({title: 'Legacy Blog | QDJr'})
useSeoMeta({
  description: 'Archived posts from the old API-backed blog.',
  robots: 'noindex, follow'
})
</script>
