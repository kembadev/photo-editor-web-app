import { OffscreenCanvasContext, type OffscreenCanvasType, type OffscreenCanvasContext2DType } from './OffscreenCanvasContext.ts'

import { ReactNode, useRef, useState } from 'react'

import { initialImageBytes } from '../../reducer-like/ImageBytes.ts'

export default function OffscreenCanvasProvider ({ children }: { children: ReactNode }) {
  const [offscreenCanvasImageBytes, setOffscreenCanvasImageBytes] = useState(initialImageBytes)

  const offscreenCanvas = useRef<OffscreenCanvasType>(null)
  const offscreenCanvasContext2D = useRef<OffscreenCanvasContext2DType>(null)

  const contextValue = {
    offscreenCanvas,
    offscreenCanvasContext2D,
    offscreenCanvasImageBytes,
    setOffscreenCanvasImageBytes
  }

  return (
    <OffscreenCanvasContext.Provider
      value={contextValue}
    >
      {children}
    </OffscreenCanvasContext.Provider>
  )
}
