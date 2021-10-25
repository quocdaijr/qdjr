<template>
  <div class="w-full">
    <HeaderContent :title="category.name" :description="category.description" :background="category.cover || ''"/>
    <PostList list-type="byCategory" :extra-value="category.id.toString()"/>
  </div>
</template>

<script>
import HeaderContent from "~/components/HeaderContent";
import PostList from "~/components/post/List";
export default {
  name: "CategoryDetailPage",
  components: {PostList, HeaderContent},
  validate({params}) {
    return /^[a-z0-9-]+$/.test(params.slug)
  },
  async asyncData(ctx) {
    await ctx.store.dispatch("categories/getCategory", {param: ctx.params.slug})
    const category = await ctx.store.state.categories.category
    if (!category)
      return ctx.error({statusCode: 404, message: "Page Not Found"})
    return {category}
  },
  data() {
    return {
      category: null
    }
  },
  head() {
    return {
      title: this.category.name || ''
    }
  }
}
</script>
