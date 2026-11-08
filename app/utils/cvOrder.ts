import type {Project, TimelineEntry} from '~/data/profile'

// Periods read "MM/YYYY - MM/YYYY" or "MM/YYYY - Present"; sort on the start.
const startKey = (period: string): number => Number(period.slice(3, 7)) * 100 + Number(period.slice(0, 2))

/** Work entries only, newest first (a CV reads top-down from the current job). */
export function workEntries(timeline: readonly TimelineEntry[]): TimelineEntry[] {
  return timeline.filter((entry) => entry.kind === 'work').toSorted((a, b) => startKey(b.period) - startKey(a.period))
}

/** Education entries in their source order. */
export function educationEntries(timeline: readonly TimelineEntry[]): TimelineEntry[] {
  return timeline.filter((entry) => entry.kind === 'education')
}

export interface ProjectGroup {
  group: string
  items: Project[]
}

/** Projects grouped by employer, groups in first-seen order, items in source order. */
export function projectsByEmployer(projects: readonly Project[]): ProjectGroup[] {
  return projects.reduce<ProjectGroup[]>((groups, project) => {
    const existing = groups.find((g) => g.group === project.group)
    if (existing) return groups.map((g) => (g === existing ? {...g, items: [...g.items, project]} : g))
    return [...groups, {group: project.group, items: [project]}]
  }, [])
}
