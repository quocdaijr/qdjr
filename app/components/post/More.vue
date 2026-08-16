<!--<template>-->
<!--  <div class="w-full">-->
<!--    <div class="w-14 h-14 mx-auto rounded-full bg-gray-600 bg-gradient-to-b from-gray-400 to-gray-700 cursor-pointer"-->
<!--         @click="loadMore">-->
<!--      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 pt-4 pl-4 text-gray-100" viewBox="0 0 20 20"-->
<!--           fill="currentColor">-->
<!--        <path fill-rule="evenodd"-->
<!--              d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0zm0 6a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L10 14.586l4.293-4.293a1 1 0 011.414 0z"-->
<!--              clip-rule="evenodd"/>-->
<!--      </svg>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  name: "PostMore",-->
<!--  data() {-->
<!--    return {-->
<!--      page: 2,-->
<!--      perPage: 2-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    loadMore() {-->
<!--      const txtSearch = this.$route.params.txt || null-->
<!--      this.$store.dispatch("posts/getPosts", {-->
<!--        txtSearch,-->
<!--        page: this.page,-->
<!--        perPage: this.perPage,-->
<!--        isLoadMore: true-->
<!--      })-->
<!--      this.page++-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</script>-->
