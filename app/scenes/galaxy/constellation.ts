import * as THREE from 'three'
import {mulberry32} from '../random'

// The /about Projects stop in the galaxy vibe: one star per project, each
// employer a constellation of its own, hung in the sky above the system.
export const CONSTELLATION_CENTRE = new THREE.Vector3(0, 16, -34)
const GROUP_SPACING = 9 // centres of the two constellations sit this far either side
const SPREAD = {x: 3.6, y: 2.6, z: 1.5}
const SEED = 20261003
const STAR = {size: 0.9, picked: 1.9, ease: 4}
const LABEL = {height: 0.55, gap: 0.9}

export interface ConstellationProject {
  group: string
  alt: string
}

export interface Constellation {
  group: THREE.Group
  stars: THREE.Sprite[]
  /** Fade labels and lines in while the Projects stop is centred (0..1). */
  setPresence(presence: number): void
  /** Ease the picked star up; snap when `instant`. */
  update(dt: number, focus: number | null, instant: boolean): void
}

function glowTexture(): THREE.Texture | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.8)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

function label(text: string, color: string): THREE.Sprite | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const font = '500 44px "JetBrains Mono", ui-monospace, monospace'
  ctx.font = font
  canvas.width = Math.ceil(ctx.measureText(text).width) + 16
  canvas.height = 64
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 8, 34)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: texture, transparent: true, depthWrite: false}))
  sprite.scale.set((LABEL.height * canvas.width) / canvas.height, LABEL.height, 1)
  return sprite
}

/** Runs of the same employer, in project order. */
function groupsOf(projects: readonly ConstellationProject[]): number[][] {
  return projects.reduce<number[][]>((runs, p, i) => {
    const last = runs.at(-1)
    return last && projects[last[0]].group === p.group ? [...runs.slice(0, -1), [...last, i]] : [...runs, [i]]
  }, [])
}

export function buildConstellation(
  projects: readonly ConstellationProject[],
  colors: {star: number; orbit: number; label: string},
  loadAssets: boolean
): Constellation {
  const random = mulberry32(SEED)
  const group = new THREE.Group()
  group.name = 'constellation'
  const glow = loadAssets ? glowTexture() : null
  const groups = groupsOf(projects)
  const positions: THREE.Vector3[] = []

  groups.forEach((members, g) => {
    const centre = CONSTELLATION_CENTRE.clone().add(new THREE.Vector3((g - (groups.length - 1) / 2) * GROUP_SPACING * 2, 0, 0))
    members.forEach((k, j) => {
      // Spread left to right through the group, jittered up and down.
      const t = members.length > 1 ? j / (members.length - 1) - 0.5 : 0
      positions[k] = centre.clone().add(new THREE.Vector3(t * SPREAD.x * 2, (random() - 0.5) * SPREAD.y * 2, (random() - 0.5) * SPREAD.z * 2))
    })
  })

  const labels: THREE.Sprite[] = []
  const stars = projects.map((p, k) => {
    const star = new THREE.Sprite(new THREE.SpriteMaterial({map: glow, color: colors.star, transparent: true, depthWrite: false}))
    star.name = `star-${k}`
    star.position.copy(positions[k])
    star.scale.setScalar(STAR.size)
    group.add(star)
    const text = loadAssets ? label(p.alt, colors.label) : null
    if (text) {
      // Alternate below/above so neighbouring labels never collide.
      text.position.copy(positions[k]).add(new THREE.Vector3(0, k % 2 === 0 ? -LABEL.gap : LABEL.gap, 0))
      labels.push(text)
      group.add(text)
    }
    return star
  })

  const pairs = groups.flatMap((members) => members.slice(1).map((k, j) => [members[j], k] as [number, number]))
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(pairs.flatMap(([a, b]) => [positions[a], positions[b]]))
  const lineMaterial = new THREE.LineBasicMaterial({color: colors.orbit, transparent: true, opacity: 0.2, depthWrite: false})
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
  lines.name = 'constellation-lines'
  lines.userData.pairs = pairs
  group.add(lines)

  return {
    group,
    stars,
    setPresence(presence) {
      lineMaterial.opacity = 0.2 + 0.45 * presence
      for (const l of labels) (l.material as THREE.SpriteMaterial).opacity = presence
    },
    update(dt, focus, instant) {
      stars.forEach((star, k) => {
        const target = k === focus ? STAR.picked : STAR.size
        const next = instant ? target : star.scale.x + (target - star.scale.x) * Math.min(1, dt * STAR.ease)
        star.scale.setScalar(next)
      })
    }
  }
}
