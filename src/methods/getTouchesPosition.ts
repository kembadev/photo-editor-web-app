import { type Position } from '../hooks/useZoom.ts'

interface TouchesPositionProps {
  e: TouchEvent;
  left: number;
  top: number
}

export function getTouchesPosition ({ e, left, top }: TouchesPositionProps) {
  const { touches } = e

  const touchesPosition: Position[] = []

  for (const touch of touches) {
    const { clientX, clientY } = touch

    touchesPosition.push({
      x: clientX - left,
      y: clientY - top
    })
  }

  return touchesPosition
}
