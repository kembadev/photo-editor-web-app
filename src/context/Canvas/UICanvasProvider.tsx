import { UICanvasContext, type UICanvasContext2DRef, type UICanvasImageDataState } from './UICanvasContext.ts'
import { ReactNode, useRef, useState } from 'react'

export default function UICanvasProvider ({ children }: { children: ReactNode }) {
  const [UICanvasImageData, setUICanvasImageData] = useState<UICanvasImageDataState>(null)

  const UICanvas = useRef<HTMLCanvasElement>(null)
  const UICanvasContext2D = useRef<UICanvasContext2DRef>(null)
  const UICanvasContainer = useRef<HTMLDivElement>(null)

  const contextValue = {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageData,
    setUICanvasImageData
  }

  return (
    <UICanvasContext.Provider
      value={contextValue}
    >
      {children}
    </UICanvasContext.Provider>
  )
}
