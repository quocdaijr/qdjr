<template>
  <div class="w-full">
    <HeaderContent title="My Blog" description=""/>
    <TagListNewest class="justify-end mb-4"/>
    <PostList/>
    <!--    <PostMore/>-->
  </div>
</template>

<script>
import PostList from "~/components/post/List";
import HeaderContent from "~/components/HeaderContent";
import TagListNewest from "~/components/tag/ListNewest"

export default {
  components: {HeaderContent, PostList, TagListNewest}
}
</script>

