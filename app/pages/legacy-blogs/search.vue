<template>
  <div class="w-full">
    <HeaderContent :title="txt"/>
    <PostList list-type="bySearch" :extra-value="txt"/>
  </div>
</template>

<script setup lang="ts">
// Was: $route.query.txt.toString() inline in the template, which threw
// "Cannot read properties of undefined (reading 'toString')" whenever
// /legacy-blogs/search was visited without a ?txt= param.
const route = useRoute()
const txt = computed(() => String(route.query.txt ?? ''))
</script>
