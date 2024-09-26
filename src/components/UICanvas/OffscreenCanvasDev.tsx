import { useLayoutEffect, useRef } from 'react'

import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'

export default function OffscreenCanvasDev () {
  const { offscreenCanvasImageData } = useOffscreenCanvas()

  const devCanvas = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    if (!offscreenCanvasImageData ||
      !devCanvas.current) return

    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvasImageData

    devCanvas.current.width = offscreenCanvasWidth
    devCanvas.current.height = offscreenCanvasHeight

    const devContext = devCanvas.current.getContext('2d')!

    devContext.putImageData(offscreenCanvasImageData, 0, 0)
  }, [offscreenCanvasImageData])

  return (
    <canvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1
      }}
      ref={devCanvas}
    />
  )
}
