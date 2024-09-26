import { OffscreenCanvasContext, type OffscreenCanvasRef, type OffscreenCanvasContext2DRef, type OffscreenCanvasImageDataState } from './OffscreenCanvasContext.ts'

import { ReactNode, useRef, useState } from 'react'

export default function OffscreenCanvasProvider ({ children }: { children: ReactNode }) {
  const [offscreenCanvasImageData, setOffscreenCanvasImageData] = useState<OffscreenCanvasImageDataState>(null)

  const offscreenCanvas = useRef<OffscreenCanvasRef>(null)
  const offscreenCanvasContext2D = useRef<OffscreenCanvasContext2DRef>(null)

  const contextValue = {
    offscreenCanvas,
    offscreenCanvasContext2D,
    offscreenCanvasImageData,
    setOffscreenCanvasImageData
  }

  return (
    <OffscreenCanvasContext.Provider
      value={contextValue}
    >
      {children}
    </OffscreenCanvasContext.Provider>
  )
}
