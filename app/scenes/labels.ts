import * as THREE from 'three'

/** A camera-facing mono text label `height` world units tall; null without a 2D canvas (tests, SSR). */
export function monoLabel(text: string, color: string, height: number): THREE.Sprite | null {
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
  sprite.scale.set((height * canvas.width) / canvas.height, height, 1)
  return sprite
}
