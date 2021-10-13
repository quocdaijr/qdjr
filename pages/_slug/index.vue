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
  name: "PostDetailPageBySLug",
  components: {HeaderContent, PostDetail},
  validate({params}) {
    return /^[a-z0-9-]+$/.test(params.slug)
  },
  async asyncData(ctx) {
    await ctx.store.dispatch("posts/setPost", {param: ctx.params.slug})
    const post = await ctx.store.state.posts.post
    if (!post)
      return ctx.error({statusCode: 404, message: "Page Not Found"})
    return {post}
  },
  data() {
    return {
      post: null
    }
  },
  head() {
    return {
      title: this.post.title || ''
    }
  }
}
</script>
