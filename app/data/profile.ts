// Profile copy for / and /about, one module per language. Kept in TypeScript
// rather than i18n JSON because vue-i18n treats @ { } | as message syntax and
// this copy contains emails, URLs and pipes.
import {PROFILE_EN} from './profile.en'
import {PROFILE_VI} from './profile.vi'

export interface Skill {
  group: string
  expert?: string
  proficient?: string
  note?: string
}

export interface LabeledText {
  label: string
  text: string
}

export interface TimelineEntry {
  period: string
  org: string
  kind: 'education' | 'work'
  major?: string
  degree?: string
  position?: string
  technologies?: string
  thirdParties?: string
  achievements: readonly string[]
}

export interface Project {
  /** Employer, exactly as its timeline `org` reads; the picker groups by it. */
  group: string
  name: string
  image: string
  alt: string
  url?: string
  description: string
  role: string
}

export interface ContactRow {
  label: string
  value: string
  href?: string
}

export interface ProfileContent {
  profile: {name: string; displayName: string; role: string; photo: string; photoAlt: string; summary: string}
  quote: {text: string; author: string}
  skills: readonly Skill[]
  otherSkills: readonly LabeledText[]
  timeline: readonly TimelineEntry[]
  projects: readonly Project[]
  contact: readonly ContactRow[]
}

export type ProfileLocale = 'vi' | 'en'

export const PROFILE_CONTENT: Readonly<Record<ProfileLocale, ProfileContent>> = {vi: PROFILE_VI, en: PROFILE_EN}
