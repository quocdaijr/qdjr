import {createView, dragView, isDefaultView, zoomView, type View} from '~/scenes/viewControl'
import {shouldHandleClick} from '~/scenes/picking'

const DRAG_THRESHOLD = 5 // px: a shorter press is a click (navigate / pick)
const WHEEL_ZOOM = 0.0015 // per wheel delta unit
const DRAGGING_CLASS = 'scene-dragging'

/**
 * Drag-to-orbit and zoom for the 3D scene, desktop pointers only (on touch a
 * swipe must keep scrolling the page). Wheel zooms on the home page when it
 * does not scroll; elsewhere the wheel scrolls the journey, so zoom needs a
 * pinch (ctrl + wheel on trackpads) or ⌘/ctrl + wheel. Page UI keeps its own
 * pointer events.
 */
export function useSceneOrbit() {
  const view = shallowRef<View>(createView())
  const moved = computed(() => !isDefaultView(view.value))
  const route = useRoute()
  const getRouteBaseName = useRouteBaseName()
  let press: {x: number; y: number; dragging: boolean} | null = null
  let swallowClick = false

  const onDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.button !== 0 || !shouldHandleClick(event.target as Element)) return
    press = {x: event.clientX, y: event.clientY, dragging: false}
  }

  const onMove = (event: PointerEvent) => {
    if (!press) return
    if (!press.dragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) < DRAG_THRESHOLD) return
    if (!press.dragging) {
      press.dragging = true
      document.documentElement.classList.add(DRAGGING_CLASS)
      window.getSelection()?.removeAllRanges()
    }
    view.value = dragView(view.value, event.clientX - press.x, event.clientY - press.y)
    press.x = event.clientX
    press.y = event.clientY
  }

  const onUp = () => {
    if (press?.dragging) swallowClick = true
    press = null
    document.documentElement.classList.remove(DRAGGING_CLASS)
  }

  const onWheel = (event: WheelEvent) => {
    if (!shouldHandleClick(event.target as Element)) return
    const homeStill = getRouteBaseName(route) === 'index' && document.documentElement.scrollHeight <= window.innerHeight + 1
    if (!(event.ctrlKey || event.metaKey || homeStill)) return
    event.preventDefault() // stop the browser's own page zoom on pinch
    view.value = zoomView(view.value, Math.exp(-event.deltaY * WHEEL_ZOOM))
  }

  onMounted(() => {
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, {passive: true})
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('wheel', onWheel, {passive: false})
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    window.removeEventListener('wheel', onWheel)
    document.documentElement.classList.remove(DRAGGING_CLASS)
  })

  return {
    view,
    moved,
    zoom: (factor: number) => (view.value = zoomView(view.value, factor)),
    reset: () => (view.value = createView()),
    /** True once after a drag: the click that ends a drag must not navigate. */
    takeDragClick: () => {
      const was = swallowClick
      swallowClick = false
      return was
    }
  }
}
