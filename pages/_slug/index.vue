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
    await ctx.store.dispatch("posts/getPost", {param: ctx.params.slug})
    const post = await ctx.store.state.posts.post
    if (!post)
      return ctx.error({statusCode: 404, message: "Page Not Found"})
    let strTag = ''
    const arrTag = []
    if (post.tags) {
      post.tags.forEach(function (tag, index) {
        if (tag.name) {
          arrTag.push(tag.name)
          if (index > 0)
            strTag += (', ' + tag.name)
          else
            strTag += tag.name
        }
      })
    }
    return {post, strTag, arrTag}
  },
  head() {
    const extraMeta = [];
    this.arrTag.forEach((tag) => {
      extraMeta.push({
        'property': 'article:tag',
        'content': tag
      })
    })
    return {
      title: this.post.title || '',
      meta: [
        ...[
          {
            hid: 'description',
            name: 'description',
            content: this.post.description || ''
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: this.strTag
          },
          {
            hid: 'og:type',
            property: 'og:type',
            content: 'article'
          },
          {
            hid: 'article:published_time',
            property: 'article:published_time',
            content: this.post.published_at || ''
          },
          {
            hid: 'article:modified_time',
            property: 'article:modified_time',
            content: this.post.updated_at || ''
          },
          {
            hid: 'article:author',
            property: 'article:author',
            content: this.post.author || ''
          },
          {
            hid: 'og:url',
            property: 'og:url',
            content: (process.env.APP_URL || 'https://qdjr.me') + '/' + this.post.slug
          },
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.post.name + ' | QDJr Blog'
          },
          {
            hid: 'og:description',
            name: 'og:description',
            content: this.post.description || ''
          },
          {
            hid: 'og:image',
            name: 'og:image',
            content: this.post.thumbnail || ''
          },
          {
            hid: 'og:image:width',
            name: 'og:image:width',
            content: 1200
          },
          {
            hid: 'og:image:height',
            name: 'og:image:height',
            content: 630
          }
        ], ...extraMeta
      ]
    }
  }
}
</script>
