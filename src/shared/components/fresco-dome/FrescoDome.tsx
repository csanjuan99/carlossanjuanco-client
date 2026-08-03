import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'
import { calculateFocalPointYPercent, calculateRayIntensity } from './fresco-dome-math'

gsap.registerPlugin(ScrollTrigger)

const REVOLUTION_DURATION_SECONDS = 120
const RAY_COLOR_RGB = '212, 175, 106'
const RAY_COUNT = 10

function drawRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rotationDegrees: number,
  intensity: number,
  focalYPercent: number,
) {
  ctx.clearRect(0, 0, width, height)
  const focalX = width / 2
  const focalY = (focalYPercent / 100) * height
  const maxRadius = Math.max(width, height)

  // Rotate the whole coordinate space around the focal point rather than each ray
  // individually — keeps the rays evenly spaced as a rigid fan while it slowly spins.
  ctx.save()
  ctx.translate(focalX, focalY)
  ctx.rotate((rotationDegrees * Math.PI) / 180)

  for (let i = 0; i < RAY_COUNT; i++) {
    // Each ray is an evenly-spaced spoke from the (now-translated) focal point outward.
    const angle = (i / RAY_COUNT) * Math.PI * 2
    const endX = Math.cos(angle) * maxRadius
    const endY = Math.sin(angle) * maxRadius
    const gradient = ctx.createLinearGradient(0, 0, endX, endY)
    gradient.addColorStop(0, `rgba(${RAY_COLOR_RGB}, ${intensity})`)
    gradient.addColorStop(1, `rgba(${RAY_COLOR_RGB}, 0)`)
    ctx.strokeStyle = gradient
    ctx.lineWidth = maxRadius / RAY_COUNT
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  ctx.restore()
}

export default function FrescoDome() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      const state = {
        rotation: 0,
        intensity: calculateRayIntensity(0),
        focalYPercent: calculateFocalPointYPercent(0),
      }

      function render() {
        drawRays(ctx!, canvas!.width, canvas!.height, state.rotation, state.intensity, state.focalYPercent)
      }

      // Setting canvas.width/height clears its bitmap to transparent, so every resize
      // must repaint — otherwise the reduced-motion static frame goes blank after a resize.
      function resizeCanvas() {
        canvas!.width = window.innerWidth
        canvas!.height = window.innerHeight
        render()
      }
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      if (prefersReducedMotion) {
        return () => window.removeEventListener('resize', resizeCanvas)
      }

      const rotationTween = gsap.to(state, {
        rotation: 360,
        duration: REVOLUTION_DURATION_SECONDS,
        repeat: -1,
        ease: 'none',
      })

      // Tracks scroll across the whole document (not just this canvas) so ray intensity/
      // focal point evolve with how far into the page the user is, independent of viewport size.
      const scrollTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          state.intensity = calculateRayIntensity(self.progress)
          state.focalYPercent = calculateFocalPointYPercent(self.progress)
        },
      })

      // gsap.ticker drives the redraw every frame (not a scroll or tween callback) because
      // the slow rotation must keep animating even while the user isn't actively scrolling.
      gsap.ticker.add(render)

      // Stop redrawing when the tab is hidden so a background tab doesn't keep painting.
      function handleVisibilityChange() {
        if (document.hidden) {
          gsap.ticker.remove(render)
        } else {
          gsap.ticker.add(render)
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        window.removeEventListener('resize', resizeCanvas)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        gsap.ticker.remove(render)
        rotationTween.kill()
        scrollTrigger.kill()
      }
    },
    { dependencies: [prefersReducedMotion] },
  )

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ mixBlendMode: 'soft-light' }}
    />
  )
}
