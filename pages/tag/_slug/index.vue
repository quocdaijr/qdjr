<template>
  <div class="w-full">
    <HeaderContent :title="tag.name" :description="tag.description" :background="tag.cover || ''"/>
    <PostList list-type="byTag" :extra-value="tag.id.toString()"/>
  </div>
</template>

<script>
import HeaderContent from "~/components/HeaderContent";
import PostList from "~/components/post/List";
export default {
  name: "TagDetailPage",
  components: {PostList, HeaderContent},
  validate({params}) {
    return /^[a-z0-9-]+$/.test(params.slug)
  },
  async asyncData(ctx) {
    await ctx.store.dispatch("tags/getTag", {param: ctx.params.slug})
    const tag = await ctx.store.state.tags.tag
    if (!tag)
      return ctx.error({statusCode: 404, message: "Page Not Found"})
    return {tag}
  },
  data() {
    return {
      tag: null
    }
  },
  head() {
    return {
      title: this.tag.name || '',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.tag.description || ''
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: this.tag.name
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: (process.env.APP_URL || 'https://qdjr.me') + '/tag/' + this.tag.slug
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: this.tag.name + ' | QDJr Blog'
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: this.tag.description || ''
        },
        {
          hid: 'og:image',
          name: 'og:image',
          content: this.tag.cover || ''
        }
      ]
    }
  }
}
</script>
