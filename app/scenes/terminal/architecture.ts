import type {StationKind} from '~/data/journeyStations'

// The coding vibe's /about journey as a backend system: a request leaves the
// client, passes the gateway and one service per career stage, lands on the
// cluster that runs the projects, and ends in the contact queue. Two rows,
// left to right then back, floating over the flowing grid. Pure: tuples only.
export type Vec3 = [number, number, number]
export type NodeKind = 'client' | 'gateway' | 'service' | 'cluster' | 'queue'

export interface ArchNode {
  kind: NodeKind
  position: Vec3
  /** Technical name, the same in every language. */
  label: string
}

export interface Architecture {
  nodes: ArchNode[]
  edges: Array<[number, number]>
  pods: Array<{position: Vec3; pool: number}>
  /** Employers, in data order; each is one node pool of the cluster. */
  pools: string[]
}

const SLOTS: readonly Vec3[] = [
  [-18, 3, -10], [-10, 3.5, -13], [-2, 3, -10], [6, 3.5, -13], [14, 3, -10],
  [18, 3.5, -24], [6, 3, -28], [-8, 3.5, -26]
]
const KIND: Readonly<Record<StationKind, NodeKind>> = {
  home: 'client', workshop: 'gateway', school: 'service', office: 'service', press: 'service', tower: 'service', yard: 'cluster', post: 'queue'
}
const FIXED_LABEL: Readonly<Record<Exclude<NodeKind, 'service'>, string>> = {
  client: 'client', gateway: 'api-gateway', cluster: 'k8s/projects', queue: 'queue/contact'
}
const POD = {columns: 5, spacing: 1.4, poolGap: 1.8, lift: 0.4}

/** "Tuổi Trẻ" → "tuoi-tre". */
function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function layoutArchitecture(
  stations: readonly {kind: StationKind}[],
  timeline: readonly {short: string}[],
  projects: readonly {group: string}[]
): Architecture {
  if (stations.length > SLOTS.length) throw new Error(`architecture has ${SLOTS.length} slots for ${stations.length} stops`)
  let career = 0
  const nodes = stations.map((station, i): ArchNode => {
    const kind = KIND[station.kind]
    const label = kind === 'service' ? `svc/${slug(timeline[career++].short)}` : FIXED_LABEL[kind]
    return {kind, position: SLOTS[i], label}
  })
  const edges = nodes.slice(1).map((_, i): [number, number] => [i, i + 1])
  const pools = projects.reduce<string[]>((all, p) => (all.includes(p.group) ? all : [...all, p.group]), [])
  const cluster = nodes[stations.findIndex((s) => s.kind === 'yard')].position
  const placed = pools.map(() => 0)
  const pods = projects.map((p) => {
    const pool = pools.indexOf(p.group)
    const column = placed[pool]++
    const position: Vec3 = [
      cluster[0] + (column - (POD.columns - 1) / 2) * POD.spacing,
      cluster[1] + POD.lift,
      cluster[2] + (pool - (pools.length - 1) / 2) * POD.poolGap
    ]
    return {position, pool}
  })
  return {nodes, edges, pods, pools}
}

/** Where a packet is at fraction t (clamped 0..1) of the way from a to b. */
export function packetAt(a: Vec3, b: Vec3, t: number): Vec3 {
  const k = Math.min(1, Math.max(0, t))
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]
}
