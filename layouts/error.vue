<template>
  <div class="h-full text-gray-600 dark:text-gray-300">
    <div class="mt-24 m-auto text-center">
      <svg class="emoji-error mx-auto" height="249.135" id="Layer_1" overflow="visible" viewBox="0 0 226 249.135"
           width="226" xml:space="preserve">
        <circle cx="113" cy="113" fill="#FFE585" r="109"/>
        <line fill="none" opacity="0.29" stroke="#6E6E96" stroke-linecap="round"
              stroke-linejoin="round" stroke-width="8" x1="88.866" x2="136.866" y1="245.135" y2="245.135"/>
        <line fill="none" opacity="0.17" stroke="#6E6E96" stroke-linecap="round"
              stroke-linejoin="round" stroke-width="8" x1="154.732" x2="168.732" y1="245.135" y2="245.135"/>
        <line fill="none" opacity="0.17" stroke="#6E6E96" stroke-linecap="round"
              stroke-linejoin="round" stroke-width="8" x1="69.732" x2="58.732" y1="245.135" y2="245.135"/>
        <circle cx="68.732" cy="93" fill="#6E6E96" r="9"/>
        <path
          d="M115.568,5.947c-1.026,0-2.049,0.017-3.069,0.045  c54.425,1.551,98.069,46.155,98.069,100.955c0,55.781-45.219,101-101,101c-55.781,0-101-45.219-101-101  c0-8.786,1.124-17.309,3.232-25.436c-3.393,10.536-5.232,21.771-5.232,33.436c0,60.199,48.801,109,109,109s109-48.801,109-109  S175.768,5.947,115.568,5.947z"
          fill="#FF9900" opacity="0.24"/>
        <circle cx="156.398" cy="93" fill="#6E6E96" r="9"/>
        <ellipse cx="67.732" cy="140.894" fill="#FF0000" opacity="0.18" rx="17.372"
                 ry="8.106"/>
        <ellipse cx="154.88" cy="140.894" fill="#FF0000" opacity="0.18" rx="17.371"
                 ry="8.106"/>
        <path
          d="M13,118.5C13,61.338,59.338,15,116.5,15c55.922,0,101.477,44.353,103.427,99.797  c0.044-1.261,0.073-2.525,0.073-3.797C220,50.802,171.199,2,111,2S2,50.802,2,111c0,50.111,33.818,92.318,79.876,105.06  C41.743,201.814,13,163.518,13,118.5z"
          fill="#FFEFB5"/>
        <circle cx="113" cy="113" fill="none" r="109" stroke="#6E6E96" stroke-width="8"/>
      </svg>
      <div class=" tracking-widest mt-6">
        <span class="text-6xl block tracking-widest">{{ statusText }}</span>
        <span class="text-xl">{{ message }}</span>
      </div>
    </div>
    <div class="mt-6 text-center">
      <NuxtLink to="/" class="bg-gray-200 dark:bg-gray-600 text-lg p-3 rounded-md hover:shadow-md">Back to home
      </NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'error'
  ],
  data() {
    return {
      message: "Something went wrong!",
      statusText: this.statusCode,
      statusCode: this.error.statusCode || 500
    }
  },
  mounted() {
    switch (this.statusCode) {
      case 400:
        this.message = "Bad request!"
        break;
      case 401:
        this.message = "Access is not allowed!"
        break
      case 403:
        this.message = "You aren't permitted to see this!"
        break
      case 404:
        this.message = "Sorry, We couldn't find what you are looking for!"
        break;
      case 500:
      default:
        this.message = "Something went wrong!"
        break
    }
    const rawStatusText = this.statusCode.toString()
    this.statusText = rawStatusText.charAt(0) + "  " + rawStatusText.charAt(1) + "  " + rawStatusText.charAt(2)
  }
}
</script>

<style scoped>
.emoji-error {
  position: relative;
  animation: move 2s infinite;
}

@keyframes move {
  0% {
    top: 0;
  }
  50% {
    top: 20px;
  }
  100% {
    top: 0
  }
}
</style>

