import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// `dayjs` has always been a dependency and $dayjs(...).fromNow() has always been
// called in post/List.vue and post/Detail.vue, but nothing ever provided it — so
// $dayjs was undefined and those components threw on render. That is why
// legacy-blogs/index.vue shipped as a "Will be back soon" placeholder.
dayjs.extend(relativeTime)

export default defineNuxtPlugin(() => ({
  provide: { dayjs }
}))
