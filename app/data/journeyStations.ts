import type {ProfileContent, TimelineEntry} from './profile'

export type StationKind = 'home' | 'workshop' | 'school' | 'office' | 'press' | 'tower' | 'yard' | 'post'

export interface JourneyStation {
  kind: StationKind
  /** Project logos shown on the yard's billboards, in project order. */
  images?: readonly string[]
}

/**
 * One station per /about stop, in stop order: Hello · What I do · one per
 * career stage · Projects (one yard for all of them) · Say hello. The about page and the cartoon
 * scene both follow this order, so the train always has a station for the
 * centred stop.
 */
export function journeyStations(content: ProfileContent): JourneyStation[] {
  const jobs = content.timeline.filter((entry) => entry.kind === 'work')
  const careerKind = (entry: TimelineEntry): StationKind => {
    if (entry.kind === 'education') return 'school'
    const index = jobs.indexOf(entry)
    if (index === jobs.length - 1) return 'tower'
    return index % 2 === 0 ? 'office' : 'press'
  }

  return [
    {kind: 'home'},
    {kind: 'workshop'},
    ...content.timeline.map((entry) => ({kind: careerKind(entry)})),
    {kind: 'yard', images: content.projects.map((project) => project.image)},
    {kind: 'post'}
  ]
}
