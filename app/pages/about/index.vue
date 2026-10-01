<template>
  <div class="journey" :data-active-stop="activeStop">
    <JourneyRail :labels="STOP_LABELS" :active="activeStop"/>

    <JourneyStop :index="0" :title="PROFILE.displayName" :level="1" :active="activeStop === 0">
      <img
        :src="PROFILE.photo"
        :alt="PROFILE.photoAlt"
        width="160"
        height="160"
        class="journey-photo"
        @error="handleProfileImageError"
      >
      <p class="journey-role">{{ PROFILE.role }}</p>
      <p>{{ PROFILE.summary }}</p>
      <p class="journey-hint" aria-hidden="true">Scroll to continue ↓</p>
    </JourneyStop>

    <JourneyStop :index="1" title="What I do" :active="activeStop === 1">
      <dl class="spec">
        <template v-for="skill in SKILLS" :key="skill.group">
          <dt>{{ skill.group }}</dt>
          <dd>
            <p v-if="'expert' in skill"><span class="spec-level">Expert</span> {{ skill.expert }}</p>
            <p v-if="'proficient' in skill"><span class="spec-level">Proficient</span> {{ skill.proficient }}</p>
            <p v-if="'note' in skill">{{ skill.note }}</p>
          </dd>
        </template>
      </dl>
      <ul class="plain">
        <li v-for="item in OTHER_SKILLS" :key="item.label"><b>{{ item.label }}:</b> {{ item.text }}</li>
      </ul>
    </JourneyStop>

    <JourneyStop
      v-for="(entry, i) in TIMELINE"
      :key="entry.period"
      :index="TIMELINE_START + i"
      :title="entry.org"
      :active="activeStop === TIMELINE_START + i"
    >
      <p class="journey-period font-mono">{{ entry.period }}</p>
      <p v-if="entry.kind === 'education'"><b>Major:</b> {{ entry.major }}<br><b>Degree:</b> {{ entry.degree }}</p>
      <template v-else>
        <p><b>Position:</b> {{ entry.position }}</p>
        <p><b>Technologies:</b> {{ entry.technologies }}</p>
        <p v-if="'thirdParties' in entry"><b>3rd parties:</b> {{ entry.thirdParties }}</p>
        <p><b>Key Achievements:</b></p>
        <ul class="plain">
          <li v-for="line in entry.achievements" :key="line">{{ line }}</li>
        </ul>
      </template>
    </JourneyStop>

    <!-- One stop per project: the logo lands first, then the copy follows. -->
    <JourneyStop
      v-for="(project, i) in PROJECTS"
      :key="project.name"
      :index="PROJECTS_START + i"
      :title="project.name"
      :active="activeStop === PROJECTS_START + i"
    >
      <p class="project-kicker font-mono">
        Project {{ String(i + 1).padStart(2, '0') }} / {{ PROJECTS.length }}
        <span v-if="!('url' in project)" class="project-internal">· internal</span>
      </p>
      <img :src="project.image" :alt="project.alt" width="96" height="96" loading="lazy" class="project-logo">
      <p class="project-description">{{ project.description }}</p>
      <p class="project-role">{{ project.role }}</p>
      <a v-if="'url' in project" :href="project.url" target="_blank" rel="noopener noreferrer" class="link">Visit live →</a>
    </JourneyStop>

    <JourneyStop :index="CONTACT_INDEX" title="Say hello" :active="activeStop === CONTACT_INDEX">
      <dl class="spec">
        <template v-for="row in CONTACT" :key="row.label">
          <dt>{{ row.label }}</dt>
          <dd><a v-if="'href' in row" :href="row.href" class="link">{{ row.value }}</a><template v-else>{{ row.value }}</template></dd>
        </template>
      </dl>
      <SocialLinks size="lg" class="journey-social"/>
    </JourneyStop>
  </div>
</template>

<script setup>
import {CONTACT, OTHER_SKILLS, PROFILE, PROJECTS, SKILLS, TIMELINE} from '~/data/profile'

defineOptions({name: 'AboutPage'})

// Stop order: Hello · What I do · one per career stage · one per project · Say hello.
const TIMELINE_START = 2
const PROJECTS_START = TIMELINE_START + TIMELINE.length
const CONTACT_INDEX = PROJECTS_START + PROJECTS.length

const STOP_LABELS = [
  'Hello',
  'What I do',
  ...TIMELINE.map((entry) => entry.org),
  ...PROJECTS.map((project) => project.name),
  'Say hello'
]

const {activeStop} = useJourney(STOP_LABELS.length)

const config = useRuntimeConfig()

const TITLE = 'Quoc Dai Nguyen - Senior Backend Software Engineer'
const DESCRIPTION =
  'Quoc Dai Nguyen - Senior Backend Software Engineer with 6+ years of experience building and operating high-performance backend systems for media and e-commerce platforms'
const OG_DESCRIPTION =
  'Senior Backend Software Engineer with 6+ years of experience in system design, performance optimization, and building scalable solutions for production systems'

function handleProfileImageError(event) {
  console.warn('Profile image failed to load:', event.target.src)
  // Replace with a fallback placeholder
  event.target.src = '/no-image.jpg'
  event.target.alt = 'Profile image not available'
}

// Was an Options API head() hook, which Nuxt 3/4 do not support at all — it was
// silently ignored, so this page has been shipping with no title and no meta
// tags whatsoever.
//
// `hid` keys are dropped (removed in Unhead v2; useSeoMeta dedupes by tag
// identity). og:title/description/image were also declared with `name:` rather
// than `property:`, another long-standing bug that useSeoMeta gets right.
// process.env.baseUrl is undefined at runtime, hence useRuntimeConfig.
useHead({
  title: TITLE,
  // `keywords` is not a useSeoMeta key in Unhead v3; it belongs in raw meta.
  meta: [
    {
      name: 'keywords',
      content:
        'QDJr, Quoc Dai Nguyen, Nguyen Quoc Dai, Senior Backend Software Engineer, profile, cv, PHP, Laravel, Node.js, Kubernetes'
    }
  ]
})

useSeoMeta({
  description: DESCRIPTION,
  ogUrl: () => `${config.public.baseUrl}/about`,
  ogTitle: TITLE,
  ogDescription: OG_DESCRIPTION,
  ogImage: () => `${config.public.baseUrl}/profile.jpg`
})
</script>

<style scoped>
/* Hallmark · macrostructure: Narrative Workflow · nav: shared header + N3 rail · footer: Ft2
 * feature: F3 tabular spec (skills, contact) · F4 step sequence (timeline, projects) · design-system: design.md · designed-as-app */
.journey-photo {
  width: 10rem;
  height: 10rem;
  margin-bottom: var(--space-md);
  border-radius: 50%;
  object-fit: cover;
}

.journey-role,
.journey-period {
  margin: 0 0 var(--space-sm);
  color: var(--color-muted);
}

.journey-hint {
  margin-top: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.journey-social {
  justify-content: flex-start;
  margin-top: var(--space-md);
}

/* F3 tabular spec sheet: key/value rows with hairline rules. */
.spec {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-2xs) var(--space-md);
  margin: 0 0 var(--space-md);
}

.spec dt {
  padding-top: var(--space-2xs);
  font-weight: 700;
}

.spec dd {
  margin: 0;
  padding-bottom: var(--space-2xs);
  border-bottom: var(--rule-hair) solid var(--color-rule);
}

.spec p {
  margin: 0 0 var(--space-3xs);
}

.spec-level {
  color: var(--color-accent);
  font-weight: 700;
}

@media (width >= 40rem) {
  .spec {
    grid-template-columns: 11rem minmax(0, 1fr);
  }

  .spec dt {
    border-bottom: var(--rule-hair) solid var(--color-rule);
    padding-bottom: var(--space-2xs);
  }
}

.plain {
  margin: 0;
  padding-inline-start: var(--space-md);
}

.plain li + li {
  margin-top: var(--space-2xs);
}

/* Project stops */
.project-kicker {
  margin: 0 0 var(--space-md);
  font-size: var(--text-sm);
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.project-internal {
  color: var(--color-accent);
}

.project-logo {
  width: 6rem;
  height: 6rem;
  margin-bottom: var(--space-md);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: var(--color-paper-2);
  object-fit: contain;
}

.project-description {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-md);
  line-height: 1.45;
}

.project-role {
  margin: 0 0 var(--space-md);
  color: var(--color-muted);
}
</style>
