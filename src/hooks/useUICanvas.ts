import { useContext } from 'react'
import { UICanvasContext } from '../context/UICanvasContext.ts'

import { TypeValidation } from '../error-handling/TypeValidation.ts'

export function useUICanvas () {
  const context = useContext(UICanvasContext)

  if (context === undefined) {
    throw new TypeValidation('useUICanvas must be used within a UICanvasProvider.')
  }

  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageBytes
  } = context

  return {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageBytes
  }
}
