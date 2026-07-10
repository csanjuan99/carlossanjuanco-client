const MIN_RAY_OPACITY = 0.12
const MAX_RAY_OPACITY = 0.55
const START_FOCAL_Y_PERCENT = 30
const END_FOCAL_Y_PERCENT = 85

export function clampProgress(progress: number): number {
  return Math.min(Math.max(progress, 0), 1)
}

export function calculateRayIntensity(scrollProgress: number): number {
  const clamped = clampProgress(scrollProgress)
  return MIN_RAY_OPACITY + (MAX_RAY_OPACITY - MIN_RAY_OPACITY) * clamped
}

export function calculateFocalPointYPercent(scrollProgress: number): number {
  const clamped = clampProgress(scrollProgress)
  return START_FOCAL_Y_PERCENT + (END_FOCAL_Y_PERCENT - START_FOCAL_Y_PERCENT) * clamped
}

export function calculateRayRotationDegrees(elapsedSeconds: number, revolutionDurationSeconds: number): number {
  if (revolutionDurationSeconds <= 0) return 0
  const cycleProgress = (elapsedSeconds % revolutionDurationSeconds) / revolutionDurationSeconds
  return cycleProgress * 360
}
