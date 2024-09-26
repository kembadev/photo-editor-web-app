import { useContext } from 'react'
import { UICanvasContext } from '../../context/Canvas/UICanvasContext.ts'

import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'

export function useUICanvas () {
  const context = useContext(UICanvasContext)

  if (context === undefined) {
    throw new ContextProviderNotFound('useUICanvas must be used within a UICanvasProvider.')
  }

  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageData,
    setUICanvasImageData
  } = context

  return {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageData,
    setUICanvasImageData
  }
}
