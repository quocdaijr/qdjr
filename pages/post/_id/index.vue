<template>
  <div class="h-full">
    <HeaderContent :title="post.title"/>
    <PostDetail :post="post"/>
  </div>
</template>

<script>
import PostDetail from "~/components/post/Detail";
import HeaderContent from "~/components/HeaderContent";

export default {
  name: "PostDetailPage",
  components: {HeaderContent, PostDetail},
  validate({params}) {
    // Must be a number
    return /^\d+$/.test(params.id)
  },
  async asyncData(ctx) {
    await ctx.store.dispatch("posts/setPost", {id: ctx.params.id})
    const post = await ctx.store.state.posts.post
    if (!post)
      return ctx.error({a: "a"})
    return {post}
  }
}
</script>
