<template>
  <div class="journey" :data-active-stop="activeStop">
    <JourneyRail :labels="stopLabels" :active="activeStop" :sub="{stop: projectsIndex, count: content.projects.length, active: focus}"/>

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

    <!-- All projects share one stop; the picker is the sub-section. -->
    <JourneyStop :index="projectsIndex" :title="t('about.projects')" :active="activeStop === projectsIndex" wide>
      <JourneyProjectPicker :projects="content.projects"/>
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
defineOptions({name: 'AboutJourney'})

const {t} = useI18n()
const content = useProfile()

// Stop order: Hello · What I do · one per career stage · Projects · Say hello.
// Section lengths are identical in both languages (test/profile.spec.ts).
const TIMELINE_START = 2
const projectsIndex = computed(() => TIMELINE_START + content.value.timeline.length)
const contactIndex = computed(() => projectsIndex.value + 1)
const focus = useJourneyFocus()

const stopLabels = useJourneyLabels()

const {activeStop} = useJourney(stopLabels.value.length)

// Arriving from a scene click on / (or a shared link): stops mount after load,
// so scroll to the requested one once they exist.
const route = useRoute()
onMounted(() => {
  const id = route.hash.slice(1)
  if (id.startsWith('stop-')) nextTick(() => document.getElementById(id)?.scrollIntoView({block: 'center'}))
})

function handleProfileImageError(event: Event) {
  const img = event.target as HTMLImageElement
  console.warn('Profile image failed to load:', img.src)
  img.src = '/no-image.jpg'
}
</script>

<style scoped>
/* Hallmark · macrostructure: Narrative Workflow · nav: shared header + N3 rail · footer: Ft2
 * feature: F3 tabular spec (skills, contact) · F4 step sequence (timeline) · picker sub-section (projects) · design-system: design.md · designed-as-app */

/* The fixed rail of names takes ~11rem on the left; push the journey column
   right by whatever part of that its own margin does not already cover. */
@media (width >= 60rem) and (height >= 42rem) {
  .journey {
    padding-inline-start: max(0px, calc(11rem - (100vw - 100%) / 2));
  }
}

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

</style>
