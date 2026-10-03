import {expect, test} from 'vitest'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {layoutArchitecture, packetAt} from '~/scenes/terminal/architecture'

const {en, vi} = PROFILE_CONTENT
const arch = layoutArchitecture(journeyStations(en), en.timeline, en.projects)
const dist = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

test('one node per stop, in stop order, of the right kind', () => {
  expect(arch.nodes.map((n) => n.kind)).toEqual(['client', 'gateway', 'service', 'service', 'service', 'service', 'cluster', 'queue'])
  expect(arch.nodes.map((n) => n.label)).toEqual(['client', 'api-gateway', 'svc/hcmunre', 'svc/applancer', 'svc/tuoi-tre', 'svc/firegroup', 'k8s/projects', 'queue/contact'])
})

test('labels are the same in both languages (technical names)', () => {
  expect(layoutArchitecture(journeyStations(vi), vi.timeline, vi.projects).nodes.map((n) => n.label)).toEqual(arch.nodes.map((n) => n.label))
})

test('requests flow node to node along the journey', () => {
  expect(arch.edges).toEqual(arch.nodes.slice(1).map((_, i) => [i, i + 1]))
})

test('nodes keep their distance; pods sit inside the cluster, one pool per employer', () => {
  for (let a = 0; a < arch.nodes.length; a++) for (let b = a + 1; b < arch.nodes.length; b++) expect(dist(arch.nodes[a].position, arch.nodes[b].position)).toBeGreaterThanOrEqual(2.5)
  const cluster = arch.nodes[6].position
  expect(arch.pods).toHaveLength(en.projects.length)
  for (const pod of arch.pods) expect(dist(pod.position, cluster)).toBeLessThan(4)
  expect(arch.pools).toEqual(['FireGroup Technology', 'Tuoi Tre Newspaper'])
  arch.pods.forEach((pod, k) => expect(arch.pools[pod.pool]).toBe(en.projects[k].group))
  for (let a = 0; a < arch.pods.length; a++) for (let b = a + 1; b < arch.pods.length; b++) expect(dist(arch.pods[a].position, arch.pods[b].position)).toBeGreaterThanOrEqual(1.2)
})

test('the same map on every visit', () => {
  expect(layoutArchitecture(journeyStations(en), en.timeline, en.projects)).toEqual(arch)
})

test('packets travel straight from one node to the next', () => {
  expect(packetAt([0, 0, 0], [10, 2, -4], 0)).toEqual([0, 0, 0])
  expect(packetAt([0, 0, 0], [10, 2, -4], 1)).toEqual([10, 2, -4])
  expect(packetAt([0, 0, 0], [10, 2, -4], 0.5)).toEqual([5, 1, -2])
  expect(packetAt([0, 0, 0], [10, 2, -4], 3)).toEqual([10, 2, -4])
})
