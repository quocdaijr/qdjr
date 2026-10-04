import type * as THREE from 'three'

/** Free every GPU resource reachable from the graph. scene.remove() alone leaks. */
export function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh
    mesh.geometry?.dispose()
    if ((object as THREE.InstancedMesh).isInstancedMesh) (object as THREE.InstancedMesh).dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach((material) => {
      if (!material) return
      Object.values(material).forEach((value) => {
        if ((value as THREE.Texture)?.isTexture) (value as THREE.Texture).dispose()
      })
      material.dispose()
    })
  })
  scene.fog = null
  scene.background = null
  scene.clear()
}
