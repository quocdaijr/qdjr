<template>
  <section class="hero">
    <h1 class="hero-display font-display reveal" :style="{'--i': 0}">{{ PROFILE.name }}</h1>
    <p class="hero-role reveal" :style="{'--i': 1}">{{ PROFILE.role }}</p>
    <blockquote class="hero-quote reveal" :style="{'--i': 2}">
      <p>“{{ QUOTE.text }}.”</p>
      <footer>— {{ QUOTE.author }}</footer>
    </blockquote>
    <nav class="hero-links reveal" :style="{'--i': 3}" aria-label="Primary">
      <NuxtLink to="/about" class="link">About me →</NuxtLink>
      <NuxtLink to="/blog" class="link">Read the blog →</NuxtLink>
    </nav>
    <div class="hero-vibes reveal" :style="{'--i': 4}">
      <p class="hero-vibes-label">Pick a vibe</p>
      <VibeSwitch variant="segmented"/>
    </div>
  </section>
</template>

<script setup lang="ts">
import {PROFILE, QUOTE} from '~/data/profile'
</script>

<style scoped>
/* Hallmark · macrostructure: Marquee Hero · H1 knobs: size=xl, alignment=left-bias, underlay=none
 * nav: shared header · footer: Ft2 · enrichment: three.js canvas (layout) · design-system: design.md · designed-as-app */
.hero {
  display: grid;
  align-content: center;
  gap: var(--space-md);
  min-height: 60svh;
  padding: var(--space-2xl) var(--space-sm) var(--space-xl);
  color: var(--color-ink);
}

.hero-display {
  margin: 0;
  font-size: var(--text-display);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
  min-width: 0;
}

/* Terminal vibe: the N8 prompt, as a typographic cue only. */
[data-vibe="terminal"] .hero-display::before {
  content: "$ whoami" / ""; /* decorative: keep it out of the h1 accessible name */
  display: block;
  margin-bottom: var(--space-2xs);
  font-size: var(--text-md);
  font-weight: 400;
  letter-spacing: 0;
  color: var(--color-accent);
}

.hero-role {
  margin: 0;
  font-size: var(--text-md);
  color: var(--color-muted);
}

.hero-quote {
  max-width: 48ch;
  margin: var(--space-sm) 0 0;
  padding-inline-start: var(--space-sm);
  border-inline-start: 2px solid var(--color-accent);
  font-size: var(--text-base);
}

.hero-quote p {
  margin: 0;
}

.hero-quote footer {
  margin-top: var(--space-3xs);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-sm);
  font-size: var(--text-md);
}

.hero-vibes {
  display: grid;
  gap: var(--space-2xs);
  justify-items: start;
  margin-top: var(--space-lg);
}

.hero-vibes-label {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
