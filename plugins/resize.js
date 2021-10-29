export default (context, inject) => {
  inject('urlResize', (url, size = '720p') => {
    return url.replace('/r/', '/i/' + size + '/')
  })
}
