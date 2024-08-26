import { initialImageBytes } from '../reducer-like/ImageBytes.ts'

import { UICanvasContext, type UICanvasContext2DType } from './UICanvasContext.ts'
import { ReactNode, useRef, useState } from 'react'

export default function UICanvasProvider ({ children }: { children: ReactNode }) {
  const [UICanvasImageBytes, setUICanvasImageBytes] = useState(initialImageBytes)

  const UICanvas = useRef<HTMLCanvasElement>(null)
  const UICanvasContext2D = useRef<UICanvasContext2DType>(null)
  const UICanvasContainer = useRef<HTMLDivElement>(null)

  const contextValue = {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageBytes,
    setUICanvasImageBytes
  }

  return (
    <UICanvasContext.Provider
      value={contextValue}
    >
      {children}
    </UICanvasContext.Provider>
  )
}
