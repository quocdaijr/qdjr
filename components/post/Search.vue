<template>
  <div class="flex justify-end">
    <!--    <label class="text-md font-bold text-gray-500 mr-2">Search: </label>-->
    <form action="/search" class="w-3/4 shadow p-1 rounded-lg flex mx-auto bg-gray-50 text-gray-600 border border-gray-300 hover:border-gray-400
     dark:text-gray-300 dark:bg-gray-700 dark:border-gray-700 dark:hover:border-gray-500">
      <input class="w-full rounded p-1 focus:outline-none bg-gray-50 dark:bg-gray-700"
             type="text" name="txt" v-model="txt"
             placeholder="Search post ...">
      <button type="submit" class="">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "PostSearch",
  data() {
    return {
      txt: this.$route.query.txt || ""
    }
  },
  // watch: {
  //   txtSearch: function searchPost() {
  //     this.$store.dispatch("posts/getPosts", {txtSearch: this.txtSearch})
  //   }
  // }
}
</script>
