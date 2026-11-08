<template>
  <article class="cv">
    <header class="cv-head">
      <img :src="content.profile.photo" :alt="content.profile.photoAlt" width="96" height="96" class="cv-photo">
      <div class="cv-head-text">
        <h1 class="cv-name font-display">{{ content.profile.displayName }}</h1>
        <p class="cv-role">{{ content.profile.role }}</p>
      </div>
      <CvPrintButton/>
    </header>
    <p class="cv-contact" :aria-label="t('cv.contact')">
      <template v-for="(row, i) in contactRows" :key="row.label">
        <span v-if="i" class="cv-dot" aria-hidden="true">·</span>
        <a v-if="row.href" :href="row.href" class="link">{{ row.value }}</a>
        <span v-else>{{ row.value }}</span>
      </template>
    </p>
    <SocialLinks size="sm" class="cv-social no-print"/>

    <section class="cv-section">
      <h2>{{ t('cv.summary') }}</h2>
      <p>{{ content.profile.summary }}</p>
    </section>

    <section class="cv-section">
      <h2>{{ t('cv.experience') }}</h2>
      <section v-for="job in jobs" :key="job.period" class="cv-job">
        <h3>{{ job.position }} · {{ job.org }}</h3>
        <p class="cv-period">{{ job.period }}</p>
        <ul class="plain">
          <li v-for="line in job.achievements" :key="line">{{ line }}</li>
        </ul>
        <p class="cv-stack"><b>{{ t('about.technologies') }}:</b> {{ job.technologies }}</p>
        <p v-if="job.thirdParties" class="cv-stack"><b>{{ t('about.thirdParties') }}:</b> {{ job.thirdParties }}</p>
      </section>
    </section>

    <section class="cv-section">
      <h2>{{ t('cv.projects') }}</h2>
      <template v-for="group in projectGroups" :key="group.group">
        <h3>{{ group.group }}</h3>
        <ul class="plain cv-projects">
          <li v-for="project in group.items" :key="project.name">
            <a v-if="project.url" :href="project.url" class="link" target="_blank" rel="noopener noreferrer">{{ project.name }}</a>
            <span v-else>{{ project.name }}</span>
            <span class="cv-project-role"> – {{ project.role }}</span>
          </li>
        </ul>
      </template>
    </section>

    <section class="cv-section">
      <h2>{{ t('cv.skills') }}</h2>
      <dl class="spec">
        <template v-for="skill in content.skills" :key="skill.group">
          <dt>{{ skill.group }}</dt>
          <dd>
            <p v-if="skill.expert" class="spec-line"><span class="spec-level">{{ t('about.expert') }}</span><span>{{ skill.expert }}</span></p>
            <p v-if="skill.proficient" class="spec-line"><span class="spec-level">{{ t('about.proficient') }}</span><span>{{ skill.proficient }}</span></p>
            <p v-if="skill.note">{{ skill.note }}</p>
          </dd>
        </template>
      </dl>
    </section>

    <section class="cv-section">
      <h2>{{ t('cv.education') }}</h2>
      <p v-for="school in education" :key="school.period">
        <b>{{ school.org }}</b><br>
        {{ school.major }} · {{ school.degree }}<br>
        <span class="cv-period">{{ school.period }}</span>
      </p>
    </section>

    <section class="cv-section">
      <h2>{{ t('cv.more') }}</h2>
      <dl class="spec">
        <template v-for="item in content.otherSkills" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd><p>{{ item.text }}</p></dd>
        </template>
      </dl>
    </section>
  </article>
</template>

<script setup lang="ts">
import {educationEntries, projectsByEmployer, workEntries} from '~/utils/cvOrder'

defineOptions({name: 'CvSheet'})

const {t} = useI18n()
const content = useProfile()

const jobs = computed(() => workEntries(content.value.timeline))
const education = computed(() => educationEntries(content.value.timeline))
const projectGroups = computed(() => projectsByEmployer(content.value.projects))
// The name and role already head the sheet; every other contact row goes on
// the contact line (phone, email, years, date of birth, address).
const contactRows = computed(() => {
  const {name, displayName, role} = content.value.profile
  return content.value.contact.filter((row) => ![name, displayName, role].includes(row.value))
})
</script>

<style scoped>
/* The plain CV: one reading column, hairline-ruled sections, no motion.
   The .spec / .plain rows are shared with the journey (main.css). */
.cv {
  max-width: 72ch;
  padding: var(--space-lg) var(--space-sm) var(--space-xl);
  color: var(--color-ink);
  font-size: var(--text-base);
  line-height: 1.55;
}

.cv-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm) var(--space-md);
}

.cv-head-text {
  flex: 1 1 16rem;
}

.cv-photo {
  flex: 0 0 auto;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: cover;
}

.cv-name {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.cv-role {
  margin: var(--space-3xs) 0 0;
  font-size: var(--text-md);
  color: var(--color-muted);
}

.cv-contact {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs);
  margin: var(--space-sm) 0 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.cv-dot {
  color: var(--color-rule);
}

.cv-social {
  justify-content: flex-start;
  margin-top: var(--space-xs);
}

.cv-section {
  margin-top: var(--space-lg);
  padding-top: var(--space-sm);
  border-top: var(--rule-hair) solid var(--color-rule);
}

.cv-section h2 {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.cv-section h3 {
  margin: var(--space-sm) 0 var(--space-3xs);
  font-size: var(--text-md);
  font-weight: 700;
}

.cv-section p {
  margin: 0 0 var(--space-2xs);
}

.cv-job + .cv-job {
  margin-top: var(--space-md);
}

.cv-period {
  margin: 0 0 var(--space-2xs);
  font-family: var(--vibe-font-mono);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.cv-stack {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.cv-job .plain {
  margin-bottom: var(--space-2xs);
}

.cv-project-role {
  color: var(--color-muted);
}
</style>
