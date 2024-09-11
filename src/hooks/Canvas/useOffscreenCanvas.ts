import { useContext } from 'react'
import { OffscreenCanvasContext } from '../../context/Canvas/OffscreenCanvasContext.ts'

import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'

export function useOffscreenCanvas () {
  const context = useContext(OffscreenCanvasContext)

  if (context === undefined) {
    throw new ContextProviderNotFound('useOffscreenCanvas must be used within a OffscreenCanvasProvider.')
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
