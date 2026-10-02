<template>
  <div class="journey" :data-active-stop="activeStop">
    <JourneyRail :labels="stopLabels" :active="activeStop"/>

    <JourneyStop :index="0" :title="content.profile.displayName" :level="1" :active="activeStop === 0">
      <img
        :src="content.profile.photo"
        :alt="content.profile.photoAlt"
        width="160"
        height="160"
        class="journey-photo"
        @error="handleProfileImageError"
      >
      <p class="journey-role">{{ content.profile.role }}</p>
      <p>{{ content.profile.summary }}</p>
      <p class="journey-hint" aria-hidden="true">{{ t('about.scrollHint') }}</p>
    </JourneyStop>

    <JourneyStop :index="1" :title="t('about.whatIDo')" :active="activeStop === 1">
      <!-- One table: technical skills, then the soft skills in the same rhythm. -->
      <dl class="spec">
        <template v-for="skill in content.skills" :key="skill.group">
          <dt>{{ skill.group }}</dt>
          <dd>
            <p v-if="skill.expert" class="spec-line"><span class="spec-level">{{ t('about.expert') }}</span><span>{{ skill.expert }}</span></p>
            <p v-if="skill.proficient" class="spec-line"><span class="spec-level">{{ t('about.proficient') }}</span><span>{{ skill.proficient }}</span></p>
            <p v-if="skill.note">{{ skill.note }}</p>
          </dd>
        </template>
        <template v-for="item in content.otherSkills" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd><p>{{ item.text }}</p></dd>
        </template>
      </dl>
    </JourneyStop>

    <JourneyStop
      v-for="(entry, i) in content.timeline"
      :key="entry.period"
      :index="TIMELINE_START + i"
      :title="entry.org"
      :active="activeStop === TIMELINE_START + i"
    >
      <p class="journey-period font-mono">{{ entry.period }}</p>
      <p v-if="entry.kind === 'education'"><b>{{ t('about.major') }}:</b> {{ entry.major }}<br><b>{{ t('about.degree') }}:</b> {{ entry.degree }}</p>
      <template v-else>
        <p><b>{{ t('about.position') }}:</b> {{ entry.position }}</p>
        <p><b>{{ t('about.technologies') }}:</b> {{ entry.technologies }}</p>
        <p v-if="entry.thirdParties"><b>{{ t('about.thirdParties') }}:</b> {{ entry.thirdParties }}</p>
        <p><b>{{ t('about.keyAchievements') }}:</b></p>
        <ul class="plain">
          <li v-for="line in entry.achievements" :key="line">{{ line }}</li>
        </ul>
      </template>
    </JourneyStop>

    <!-- One stop per project: the logo lands first, then the copy follows. -->
    <JourneyStop
      v-for="(project, i) in content.projects"
      :key="project.image + i"
      :index="projectsStart + i"
      :title="project.name"
      :active="activeStop === projectsStart + i"
    >
      <p class="project-kicker font-mono">
        {{ t('about.projectCount', {n: String(i + 1).padStart(2, '0'), total: content.projects.length}) }}
        <span v-if="!project.url" class="project-internal">· {{ t('about.internal') }}</span>
      </p>
      <img :src="project.image" :alt="project.alt" width="96" height="96" loading="lazy" class="project-logo">
      <p class="project-description">{{ project.description }}</p>
      <p class="project-role">{{ project.role }}</p>
      <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="link">{{ t('about.visitLive') }}</a>
    </JourneyStop>

    <JourneyStop :index="contactIndex" :title="t('about.sayHello')" :active="activeStop === contactIndex">
      <dl class="spec">
        <template v-for="row in content.contact" :key="row.label">
          <dt>{{ row.label }}</dt>
          <dd><a v-if="row.href" :href="row.href" class="link">{{ row.value }}</a><template v-else>{{ row.value }}</template></dd>
        </template>
      </dl>
      <SocialLinks size="lg" class="journey-social"/>
    </JourneyStop>
  </div>
</template>

<script setup lang="ts">
defineOptions({name: 'AboutPage'})

const {t} = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const content = useProfile()

// Stop order: Hello · What I do · one per career stage · one per project · Say hello.
// Section lengths are identical in both languages (test/profile.spec.ts).
const TIMELINE_START = 2
const projectsStart = computed(() => TIMELINE_START + content.value.timeline.length)
const contactIndex = computed(() => projectsStart.value + content.value.projects.length)

const stopLabels = computed(() => [
  t('about.hello'),
  t('about.whatIDo'),
  ...content.value.timeline.map((entry) => entry.org),
  ...content.value.projects.map((project) => project.name),
  t('about.sayHello')
])

const {activeStop} = useJourney(stopLabels.value.length)

function handleProfileImageError(event: Event) {
  const img = event.target as HTMLImageElement
  console.warn('Profile image failed to load:', img.src)
  img.src = '/no-image.jpg'
}

useHead(() => ({
  title: t('about.meta.title'),
  // `keywords` is not a useSeoMeta key in Unhead v3; it belongs in raw meta.
  meta: [{name: 'keywords', content: t('about.meta.keywords')}]
}))

useSeoMeta({
  description: () => t('about.meta.description'),
  ogUrl: () => `${config.public.baseUrl}${localePath('/about')}`,
  ogTitle: () => t('about.meta.title'),
  ogDescription: () => t('about.meta.ogDescription'),
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

/* F3 tabular spec sheet: label | value rows. The hairline runs unbroken under
   both columns (no column gap; the value column pads itself), and label and
   value share the same top padding so their first lines align. */
.spec {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0 0 var(--space-md);
  border-top: var(--rule-hair) solid var(--color-rule);
}

.spec dt {
  padding-top: var(--space-xs);
  font-weight: 700;
}

.spec dd {
  margin: 0;
  padding: var(--space-3xs) 0 var(--space-xs);
  border-bottom: var(--rule-hair) solid var(--color-rule);
}

.spec p {
  margin: 0 0 var(--space-3xs);
}

.spec p:last-child {
  margin-bottom: 0;
}

/* "Expert  PHP (Yii2, Laravel)": wrapped values indent past the level label. */
.spec-line {
  display: grid;
  grid-template-columns: 6.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: var(--space-2xs);
}

.spec-level {
  color: var(--color-accent);
  font-weight: 700;
}

@media (width >= 40rem) {
  .spec {
    grid-template-columns: 13rem minmax(0, 1fr);
  }

  .spec dt {
    padding: var(--space-xs) var(--space-md) var(--space-xs) 0;
    border-bottom: var(--rule-hair) solid var(--color-rule);
  }

  .spec dd {
    padding-top: var(--space-xs);
  }
}

.plain {
  margin: 0;
  padding-inline-start: var(--space-md);
  list-style: disc;
}

.plain li::marker {
  color: var(--color-muted);
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
