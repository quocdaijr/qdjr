import type {BlogCollectionItem, BlogEnCollectionItem} from '@nuxt/content'

export type BlogPost = (BlogCollectionItem | BlogEnCollectionItem) & {originalOnly?: boolean}

/** All published posts for a language; English falls back to originals. */
export async function fetchBlogPosts(locale: string): Promise<BlogPost[]> {
  const originals = await queryCollection('blog').where('draft', '=', false).order('publishedAt', 'DESC').all()
  if (locale !== 'en') return originals
  const translations = await queryCollection('blog_en').where('draft', '=', false).all()
  return mergeTranslations(originals, translations)
}

/** One post by content path (/blog/<slug>); English falls back to the original. */
export async function fetchBlogPost(path: string, locale: string): Promise<BlogPost | null> {
  if (locale === 'en') {
    const translated = await queryCollection('blog_en').path(path).first()
    if (translated) return translated
    const original = await queryCollection('blog').path(path).first()
    return original ? {...original, originalOnly: true} : null
  }
  return queryCollection('blog').path(path).first()
}
