// A 3D git history for the coding vibe's Projects stop: one trunk per
// employer (in data order, top to bottom) and one feature branch per project
// that forks off its employer's trunk, runs a few commits and merges back.
// Pure: plain tuples, no three.js, so the layout is unit-tested.
//
// Every branch has the same number of commits on purpose. The graph is a
// shape, not a record: it never claims how much work went into a project.
export type Vec3 = [number, number, number]

export const BRANCH_COMMITS = 3
const STEP = 5 // trunk distance between two forks
const LANE = 1.6 // branch height above its trunk
const TRUNK_GAP = 3.2
const COMMIT_GAP = 1

export interface GraphBranch {
  trunk: number
  fork: Vec3
  commits: Vec3[]
  merge: Vec3
}

export interface Graph {
  trunks: Vec3[][]
  branches: GraphBranch[]
}

export function layoutGraph(projects: readonly {group: string}[]): Graph {
  const groups = projects.reduce<string[]>((all, p) => (all.includes(p.group) ? all : [...all, p.group]), [])
  const members = groups.map((g) => projects.flatMap((p, k) => (p.group === g ? [k] : [])))
  const longest = Math.max(...members.map((m) => m.length))
  const length = (longest - 1) * STEP + (BRANCH_COMMITS + 2) * COMMIT_GAP + 1
  const x0 = -length / 2
  const y0 = ((groups.length - 1) * TRUNK_GAP) / 2
  const trunkY = (g: number) => y0 - g * TRUNK_GAP

  const trunks = groups.map((_, g) => Array.from({length: length + 1}, (__, i): Vec3 => [x0 + i * COMMIT_GAP, trunkY(g), 0]))
  const branches: GraphBranch[] = []
  members.forEach((ks, g) =>
    ks.forEach((k, j) => {
      const forkX = x0 + (j * STEP + 1) * COMMIT_GAP
      branches[k] = {
        trunk: g,
        fork: [forkX, trunkY(g), 0],
        commits: Array.from({length: BRANCH_COMMITS}, (_, i): Vec3 => [forkX + (i + 1) * COMMIT_GAP, trunkY(g) + LANE, 0]),
        merge: [forkX + (BRANCH_COMMITS + 1) * COMMIT_GAP, trunkY(g), 0]
      }
    })
  )
  return {trunks, branches}
}
