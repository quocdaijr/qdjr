<template>
  <div class="h-full flex flex-col justify-between">
    <ContentHeader title="Home"
                   description="I didn't know what to write. So I put the clock here for you to see the time :)))"/>
    <Clock class="flex-grow"/>
  </div>
</template>

<script>
import ContentHeader from "~/components/HeaderContent"
import Clock from "~/components/Clock"

export default {
  components: {Clock, ContentHeader}
}
</script>
