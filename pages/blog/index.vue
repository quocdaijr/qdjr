<template>
  <div class="w-full">
    <HeaderContent title="Blog" description="Just like the homepage, I don't know what to write here :)))"/>
    <PostList/>
<!--    <PostMore/>-->
  </div>
</template>

<script>

import PostList from "~/components/post/List";
import HeaderContent from "~/components/HeaderContent";
export default {
  components: { HeaderContent, PostList}
}
</script>
<style>
body {
  background-color: white;
}
</style>

