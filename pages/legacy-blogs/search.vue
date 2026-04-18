<template>
  <div class="w-full">
    <HeaderContent :title="$route.query.txt"/>
    <PostList list-type="bySearch" :extra-value="$route.query.txt.toString()"/>
  </div>
</template>

<script>
import HeaderContent from "~/components/HeaderContent";
import PostList from "~/components/post/List";

export default {
  name: "index",
  components: {PostList, HeaderContent}
}
</script>
