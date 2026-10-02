import * as THREE from 'three'
import {layoutGraph, type Vec3} from './graph'

const CUBE = 0.35
const HEAD_SIZE = 0.7
const DIM = 0.25
const PULSE = {duration: 0.3, amount: 0.15}
const HEAD_EASE = 6
const LABEL = {height: 0.5, rise: 0.75}

export interface GraphProject {
  group: string
  alt: string
}

export interface CommitGraph {
  group: THREE.Group
  /** World position of branch k's last commit. */
  tip(k: number): THREE.Vector3
  update(dt: number, elapsed: number, focus: number | null, instant: boolean): void
}

function label(text: string, color: string): THREE.Sprite | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const font = '500 40px "JetBrains Mono", ui-monospace, monospace'
  ctx.font = font
  canvas.width = Math.ceil(ctx.measureText(text).width) + 12
  canvas.height = 56
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 6, 30)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: texture, transparent: true, depthWrite: false}))
  sprite.scale.set((LABEL.height * canvas.width) / canvas.height, LABEL.height, 1)
  return sprite
}

const v = (p: Vec3) => new THREE.Vector3(...p)

function polyline(points: Vec3[], color: number, opacity: number): THREE.Line {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points.map(v)),
    new THREE.LineBasicMaterial({color, transparent: true, opacity})
  )
}

export function buildCommitGraph(
  projects: readonly GraphProject[],
  colors: {grid: number; solid: number; label: string},
  loadAssets: boolean
): CommitGraph {
  const layout = layoutGraph(projects)
  const group = new THREE.Group()
  group.name = 'commit-graph'

  for (const trunk of layout.trunks) group.add(polyline(trunk, colors.grid, 0.6))

  // Every commit is one instance of one cube; branch commits are tinted on pick.
  const nodes = [...layout.trunks.flat(), ...layout.branches.flatMap((b) => b.commits)]
  const cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(CUBE, CUBE, CUBE), new THREE.MeshBasicMaterial({color: 0xffffff}), nodes.length)
  const m = new THREE.Matrix4()
  const bright = new THREE.Color(colors.grid)
  const dim = new THREE.Color(colors.solid)
  nodes.forEach((p, i) => {
    cubes.setMatrixAt(i, m.makeTranslation(...p))
    cubes.setColorAt(i, bright)
  })
  group.add(cubes)
  const trunkCount = layout.trunks.flat().length

  const branches = layout.branches.map((b, k) => {
    const branch = new THREE.Group()
    branch.name = `branch-${k}`
    const line = polyline([b.fork, ...b.commits, b.merge], colors.grid, 1)
    line.name = `branch-line-${k}`
    branch.add(line)
    const text = loadAssets ? label(projects[k].alt, colors.label) : null
    if (text) {
      text.position.copy(v(b.commits[1])).add(new THREE.Vector3(0, LABEL.rise, 0))
      branch.add(text)
    }
    group.add(branch)
    return {branch, line, first: trunkCount + k * b.commits.length, count: b.commits.length, tip: v(b.commits.at(-1)!)}
  })

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(HEAD_SIZE, HEAD_SIZE, HEAD_SIZE),
    new THREE.MeshBasicMaterial({color: colors.grid, wireframe: true})
  )
  head.name = 'HEAD'
  head.visible = false
  const headLabel = loadAssets ? label('HEAD', colors.label) : null
  if (headLabel) {
    // Beside the marker, so it never sits on the branch's own label above.
    headLabel.position.set(HEAD_SIZE / 2 + headLabel.scale.x / 2 + 0.1, 0, 0)
    head.add(headLabel)
  }
  group.add(head)

  let lastFocus: number | null = null
  let pulseAt = -Infinity
  const tipWorld = (k: number) => {
    group.updateWorldMatrix(true, false)
    return branches[k].tip.clone().applyMatrix4(group.matrixWorld)
  }

  return {
    group,
    tip: tipWorld,
    update(dt, elapsed, focus, instant) {
      if (focus !== lastFocus) {
        branches.forEach((b, k) => {
          ;(b.line.material as THREE.LineBasicMaterial).opacity = focus === null || k === focus ? 1 : DIM
          for (let i = 0; i < b.count; i++) cubes.setColorAt(b.first + i, focus === null || k === focus ? bright : dim)
        })
        if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true
        if (focus !== null && !instant) pulseAt = elapsed
        lastFocus = focus
      }
      head.visible = focus !== null
      if (focus !== null) {
        const target = branches[focus].tip
        if (instant) head.position.copy(target)
        else head.position.lerp(target, Math.min(1, dt * HEAD_EASE))
        // HEAD swells once as it lands on a new pick; skipped under reduced motion.
        const t = (elapsed - pulseAt) / PULSE.duration
        head.scale.setScalar(t >= 0 && t < 1 ? 1 + PULSE.amount * Math.sin(Math.PI * t) : 1)
      }
      branches.forEach((b, k) => (b.branch.userData.tip = tipWorld(k)))
    }
  }
}
