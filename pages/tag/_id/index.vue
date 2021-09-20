<template>
  <div class="w-full">
    <HeaderContent description="When I have tag details, I will update here :)))"/>
    <PostList list-type="byTag"/>
    <!--    <PostMore/>-->
  </div>
</template>

<script>
import HeaderContent from "~/components/HeaderContent";
import PostList from "~/components/post/List";
export default {
  name: "TagDetailPage",
  components: {PostList, HeaderContent}
}
</script>
