<template>
  <section class="cv-intro">
    <img :src="content.profile.photo" :alt="content.profile.photoAlt" width="112" height="112" class="cv-photo">
    <h1 class="cv-intro-name font-display">{{ content.profile.name }}</h1>
    <p class="cv-intro-role">{{ content.profile.role }}</p>
    <p class="cv-intro-summary">{{ content.profile.summary }}</p>
    <p class="cv-intro-contact">
      <template v-for="(row, i) in contactLinks" :key="row.label">
        <span v-if="i" class="cv-intro-dot" aria-hidden="true">·</span>
        <a :href="row.href" class="link">{{ row.value }}</a>
      </template>
    </p>
    <nav class="cv-intro-links" :aria-label="t('home.primary')">
      <NuxtLinkLocale to="/about" class="link">{{ t('home.cv') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/blog" class="link">{{ t('home.blog') }}</NuxtLinkLocale>
    </nav>
    <SocialLinks size="sm" class="cv-intro-social"/>
  </section>
</template>

<script setup lang="ts">
defineOptions({name: 'CvIntro'})

const {t} = useI18n()
const content = useProfile()
// The rows that are links: phone and email.
const contactLinks = computed(() => content.value.contact.filter((row) => row.href))
</script>

<style scoped>
/* The plain intro: name, role, summary, how to reach me, where to go next. */
.cv-intro {
  display: grid;
  gap: var(--space-sm);
  max-width: 64ch;
  padding: var(--space-xl) var(--space-sm);
  color: var(--color-ink);
}

.cv-photo {
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  object-fit: cover;
}

.cv-intro-name {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}

.cv-intro-role {
  margin: 0;
  font-size: var(--text-md);
  color: var(--color-muted);
}

.cv-intro-summary {
  margin: 0;
  line-height: 1.55;
}

.cv-intro-contact {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs);
  margin: 0;
  font-size: var(--text-sm);
}

.cv-intro-dot {
  color: var(--color-rule);
}

.cv-intro-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-xs);
  font-size: var(--text-md);
}

.cv-intro-social {
  justify-content: flex-start;
}
</style>
