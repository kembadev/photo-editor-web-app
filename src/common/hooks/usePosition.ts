import { useCallback, MouseEvent, TouchEvent } from 'react'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'

type PointerEvent = MouseEvent | WheelEvent
type PointerPosition = { x: number, y: number}

export function usePosition () {
  const { UICanvas } = useUICanvas()

  const getPointerPositionOnUICanvas = useCallback((event: PointerEvent) => {
    if (!UICanvas.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current
    const { left, top } = UICanvas.current.getBoundingClientRect()
    const { clientX, clientY } = event

    const positionX = clientX - left
    const positionY = clientY - top

    const pointerPosition = {
      x: positionX > 0 ? Math.min(positionX, UICanvasWidth) : 0,
      y: positionY > 0 ? Math.min(positionY, UICanvasHeight) : 0
    }

    return pointerPosition
  }, [UICanvas])

  const getTouchesPositionOnUICanvas = useCallback((event: TouchEvent, numberOfTouchesOfInterest?: number) => {
    if (!UICanvas.current) return

    const touchesPosition: PointerPosition[] = []

    const { left, top } = UICanvas.current.getBoundingClientRect()
    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current
    const { touches } = event

    const iterationLimit = numberOfTouchesOfInterest
      ? Math.min(touches.length, numberOfTouchesOfInterest)
      : touches.length

    for (let n = 0; n < iterationLimit; n++) {
      const { clientX, clientY } = touches[n]

      const positionX = clientX - left
      const positionY = clientY - top

      touchesPosition.push({
        x: positionX > 0 ? Math.min(positionX, UICanvasWidth) : 0,
        y: positionY > 0 ? Math.min(positionY, UICanvasHeight) : 0
      })
    }

    return touchesPosition
  }, [UICanvas])

  return { getPointerPositionOnUICanvas, getTouchesPositionOnUICanvas }
}
