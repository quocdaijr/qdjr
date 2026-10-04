import * as THREE from 'three'
import {monoLabel} from '../labels'
import type {Architecture, ArchNode, NodeKind} from './architecture'

// Meshes for the system-design map: wireframe edges in the grid colour over a
// dark solid body, like the old hero icosahedron (which is now the client).
const LABEL = {height: 0.42, gap: 0.5}
const POD = {size: 0.55, dim: 0.25, picked: 1.25}
const WIRE_OPACITY = 0.5
const POOL_LABEL_HEIGHT = 0.3

export interface MapColors {
  grid: number
  solid: number
  label: string
}

export interface ArchitectureMeshes {
  group: THREE.Group
  /** anchors[i] is the node for stop i, named arch-anchor-<i>. */
  anchors: THREE.Object3D[]
  /** pods[k] is project k's pod, named pod-<k>. */
  pods: THREE.Mesh[]
  /** Framing scale per anchor: the cluster is wide, so the camera stands farther back. */
  scales: number[]
  setFocus(focus: number | null): void
}

const SCALE: Readonly<Record<NodeKind, number>> = {client: 1, gateway: 1, service: 1, cluster: 1.7, queue: 1.1}

function outlined(geometry: THREE.BufferGeometry, colors: MapColors, solidOpacity = 1): THREE.Group {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: colors.solid, transparent: solidOpacity < 1, opacity: solidOpacity})))
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({color: colors.grid})))
  return g
}

function client(colors: MapColors): THREE.Group {
  const g = new THREE.Group()
  g.add(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), new THREE.MeshBasicMaterial({color: colors.solid})),
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.18, 1), new THREE.MeshBasicMaterial({color: colors.grid, wireframe: true}))
  )
  return g
}

function queue(colors: MapColors): THREE.Group {
  const body = outlined(new THREE.CapsuleGeometry(0.5, 2.2, 4, 10), colors)
  body.rotation.z = Math.PI / 2
  const g = new THREE.Group()
  g.add(body)
  for (const x of [-0.7, 0, 0.7]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.04, 6, 24), new THREE.MeshBasicMaterial({color: colors.grid}))
    ring.rotation.y = Math.PI / 2
    ring.position.x = x
    g.add(ring)
  }
  return g
}

const BUILD: Readonly<Record<Exclude<NodeKind, 'cluster'>, (colors: MapColors) => THREE.Group>> = {
  client,
  gateway: (colors) => outlined(new THREE.CylinderGeometry(1, 1, 0.7, 6), colors),
  service: (colors) => outlined(new THREE.BoxGeometry(1.4, 1.4, 1.4), colors),
  queue
}

function cluster(arch: Architecture, at: THREE.Vector3, colors: MapColors, poolNames: string[], loadAssets: boolean): {group: THREE.Group; pods: THREE.Mesh[]} {
  const group = new THREE.Group()
  group.add(outlined(new THREE.BoxGeometry(8, 0.25, 4.4), colors, 0.25))
  const pods = arch.pods.map((pod, k) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(POD.size, POD.size, POD.size), new THREE.MeshBasicMaterial({color: colors.grid, transparent: true}))
    mesh.name = `pod-${k}`
    mesh.position.set(pod.position[0] - at.x, pod.position[1] - at.y, pod.position[2] - at.z)
    mesh.userData.radius = POD.size / 2
    group.add(mesh)
    return mesh
  })
  if (loadAssets) {
    arch.pools.forEach((_, p) => {
      const first = arch.pods.find((pod) => pod.pool === p)
      const label = first ? monoLabel(poolNames[p], colors.label, POOL_LABEL_HEIGHT) : null
      if (!first || !label) return
      label.position.set(-4 + label.scale.x / 2 + 0.2, 0.5, first.position[2] - at.z)
      group.add(label)
    })
  }
  return {group, pods}
}

function nodeMesh(node: ArchNode, colors: MapColors, loadAssets: boolean): THREE.Group {
  const g = node.kind === 'cluster' ? new THREE.Group() : BUILD[node.kind](colors)
  const label = loadAssets ? monoLabel(node.label, colors.label, LABEL.height) : null
  if (label) {
    // The cluster's name stands at its back edge, out of the way of a zoomed-in pod.
    if (node.kind === 'cluster') label.position.set(0, 0.6 + LABEL.gap, -2.4)
    else label.position.y = 1.2 + LABEL.gap
    g.add(label)
  }
  return g
}

export function buildArchitecture(arch: Architecture, colors: MapColors, poolNames: string[], loadAssets: boolean): ArchitectureMeshes {
  const group = new THREE.Group()
  group.name = 'architecture'
  let pods: THREE.Mesh[] = []
  const anchors = arch.nodes.map((node, i) => {
    const mesh = nodeMesh(node, colors, loadAssets)
    mesh.position.set(...node.position)
    mesh.name = `arch-anchor-${i}`
    if (node.kind === 'cluster') {
      const built = cluster(arch, mesh.position, colors, poolNames, loadAssets)
      mesh.add(built.group)
      pods = built.pods
    }
    group.add(mesh)
    return mesh
  })
  for (const [a, b] of arch.edges) {
    const wire = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...arch.nodes[a].position), new THREE.Vector3(...arch.nodes[b].position)]),
      new THREE.LineBasicMaterial({color: colors.grid, transparent: true, opacity: WIRE_OPACITY})
    )
    group.add(wire)
  }

  return {
    group,
    anchors,
    pods,
    scales: arch.nodes.map((n) => SCALE[n.kind]),
    setFocus(focus) {
      pods.forEach((pod, k) => {
        const on = focus === null || k === focus
        ;(pod.material as THREE.MeshBasicMaterial).opacity = on ? 1 : POD.dim
        pod.scale.setScalar(k === focus ? POD.picked : 1)
      })
    }
  }
}
