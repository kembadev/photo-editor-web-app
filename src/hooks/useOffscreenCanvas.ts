import { useContext } from 'react'
import { OffscreenCanvasContext } from '../context/OffscreenCanvasContext.ts'

import { TypeValidation } from '../error-handling/TypeValidation.ts'

export function useOffscreenCanvas () {
  const context = useContext(OffscreenCanvasContext)

  if (context === undefined) {
    throw new TypeValidation('useOffscreenCanvas must be used within a OffscreenCanvasProvider.')
  }

  const {
    offscreenCanvas,
    offscreenCanvasContext2D,
    offscreenCanvasImageBytes
  } = context

  return {
    offscreenCanvas,
    offscreenCanvasContext2D,
    offscreenCanvasImageBytes
  }
}
