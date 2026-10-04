// URL resize utility plugin for Nuxt 3 with TypeScript

export default defineNuxtPlugin(() => {
  const urlResize = (url: string, size: string = '720p'): string => {
    return url.replace('/r/', `/i/${size}/`)
  }

  return {
    provide: {
      urlResize
    }
  }
})
