import * as THREE from 'three'
import {projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {panelAim} from '../framing'
import {approach, type SceneFactory} from '../types'
import {buildCommitGraph} from './commitGraph'

// Hex because THREE.Color cannot parse oklch(); mirrors tokens.css terminal.
const PALETTE = {
  dark: {bg: 0x0b1410, grid: 0x39ff8a, solid: 0x1b3b2a, label: '#39ff8a'},
  light: {bg: 0xeef5f0, grid: 0x13884a, solid: 0xb9d6c4, label: '#0e6a39'}
} as const

const GRID_SIZE = 80
const GRID_SEGMENTS = 60
const GRID_Y = -2
const FLOW_SPEED = 2.2 // world units per second toward the camera
const FOG_NEAR = 6
const FOG_FAR = 46
const ROAD_HALF_WIDTH = 6
const Z_PERIODS = 3 // height must repeat every GRID_SIZE in z so the two tiles loop seamlessly
const CAMERA_FOV = 60
const CAMERA_BASE_Y = 1.6
const CAMERA_BASE_Z = 8
const JOURNEY_RISE = 9 // how high the camera climbs over the /about journey
const JOURNEY_ADVANCE = 6
const POINTER_SWAY = 0.6
const ICO_POSITION = new THREE.Vector3(6, 1.8, -12) // right of the hero text column
const ICO_SPIN = 0.25

// The /about Projects stop: a git graph floats above the grid; the camera
// leaves the journey for it and keeps the picked branch tip right of the panel.
const PROJECTS = PROFILE_CONTENT.en.projects
const PROJECTS_STOP = projectsStopIndex(PROFILE_CONTENT.en)
const GRAPH = {origin: new THREE.Vector3(0, 5, -22), scale: 0.6, bob: 0.15}
const PROJECTS_CAMERA = {back: 11, overview: 17, rise: 1, shift: 7.5, drop: 2.5, blend: 2.5, glide: 2.5}

function heightAt(x: number, z: number): number {
  const road = Math.min(1, Math.abs(x) / ROAD_HALF_WIDTH)
  const zWave = Math.cos((z * Z_PERIODS * Math.PI * 2) / GRID_SIZE)
  return road * (Math.sin(x * 0.35) * 1.4 + zWave * 0.9)
}

function buildTerrain(color: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_SEGMENTS, GRID_SEGMENTS)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heightAt(position.getX(i), position.getZ(i)))
  }
  position.needsUpdate = true
  const material = new THREE.MeshBasicMaterial({color, wireframe: true, transparent: true, opacity: 0.55})
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = GRID_Y
  return mesh
}

export const createTerminalScene: SceneFactory = ({isDark, aspect, reduceMotion = false, loadAssets = true}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.bg)
  scene.fog = new THREE.Fog(colors.bg, FOG_NEAR, FOG_FAR)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 200)

  // Two tiles of the same terrain, leap-frogging so the flow never shows an edge.
  const tileA = buildTerrain(colors.grid)
  const tileB = buildTerrain(colors.grid)
  scene.add(tileA, tileB)

  const ico = new THREE.Group()
  ico.add(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({color: colors.solid})),
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), new THREE.MeshBasicMaterial({color: colors.grid, wireframe: true}))
  )
  ico.position.copy(ICO_POSITION)
  scene.add(ico)

  const graph = buildCommitGraph(PROJECTS, colors, loadAssets && typeof window !== 'undefined')
  graph.group.position.copy(GRAPH.origin)
  graph.group.scale.setScalar(GRAPH.scale)
  graph.group.visible = false
  scene.add(graph.group)

  const journeyEye = new THREE.Vector3()
  const journeyLook = new THREE.Vector3()
  const projectsEye = new THREE.Vector3()
  const projectsLook = new THREE.Vector3()
  const wantEye = new THREE.Vector3()
  const wantLook = new THREE.Vector3()
  const look = new THREE.Vector3()
  let blend = 0
  let ready = false

  const projectsCamera = (focus: number | null) => {
    const subject = focus === null ? graph.group.position : graph.tip(focus)
    wantEye.set(subject.x, subject.y + PROJECTS_CAMERA.rise, subject.z + (focus === null ? PROJECTS_CAMERA.overview : PROJECTS_CAMERA.back))
    wantLook.copy(panelAim(subject, wantEye, camera.aspect, PROJECTS_CAMERA))
  }

  return {
    scene,
    camera,
    update(dt, elapsed, progress, pointer, stop, focus) {
      const offset = (elapsed * FLOW_SPEED) % GRID_SIZE
      tileA.position.z = offset
      tileB.position.z = offset - GRID_SIZE

      const onProjects = stop === PROJECTS_STOP
      const picked = onProjects ? focus : null
      const instant = !ready || reduceMotion
      blend = instant ? (onProjects ? 1 : 0) : approach(blend, onProjects ? 1 : 0, dt, PROJECTS_CAMERA.blend)

      ico.rotation.y += dt * ICO_SPIN
      ico.rotation.x += dt * ICO_SPIN * 0.4
      ico.position.y = ICO_POSITION.y + Math.sin(elapsed * 0.9) * 0.25
      ico.scale.setScalar(Math.max(0.001, 1 - blend)) // the graph takes its place

      graph.group.visible = blend > 0.01
      graph.group.position.y = GRAPH.origin.y + (reduceMotion ? 0 : Math.sin(elapsed * 0.7) * GRAPH.bob)
      graph.update(dt, elapsed, picked, instant)

      journeyEye.set(
        pointer.x * POINTER_SWAY,
        CAMERA_BASE_Y + progress * JOURNEY_RISE - pointer.y * 0.3,
        CAMERA_BASE_Z - progress * JOURNEY_ADVANCE
      )
      journeyLook.set(0, 0.5 - progress * 2, -20)
      projectsCamera(picked)
      const glide = instant ? 1 : Math.min(1, dt * PROJECTS_CAMERA.glide)
      projectsEye.lerp(wantEye, glide)
      projectsLook.lerp(wantLook, glide)
      camera.position.lerpVectors(journeyEye, projectsEye, blend)
      look.lerpVectors(journeyLook, projectsLook, blend)
      camera.lookAt(look)
      camera.updateMatrixWorld()
      ready = true
    }
  }
}
