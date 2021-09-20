<template>
  <div class="h-full">
    <HeaderContent title="Error"
                   description="This is error page"/>
    <NuxtLink to="/">Back to home</NuxtLink>
  </div>
</template>

<script>
import HeaderContent from "~/components/HeaderContent";
export default {
  components: {HeaderContent}
}
</script>
