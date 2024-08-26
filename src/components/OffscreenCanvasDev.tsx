import { useLayoutEffect, useRef } from 'react'

import { useOffscreenCanvas } from '../hooks/useOffscreenCanvas.ts'

export default function OffscreenCanvasDev () {
  const { offscreenCanvas, offscreenCanvasImageBytes } = useOffscreenCanvas()

  const devCanvas = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    if (offscreenCanvasImageBytes.byteLength === 0 ||
      !offscreenCanvas.current ||
      !devCanvas.current) return

    const { width, height } = offscreenCanvas.current

    devCanvas.current.width = width
    devCanvas.current.height = height

    const devContext = devCanvas.current.getContext('2d')!

    const imageData = devContext.createImageData(width, height)
    imageData.data.set(offscreenCanvasImageBytes)
    devContext.putImageData(imageData, 0, 0)
  }, [offscreenCanvasImageBytes, offscreenCanvas])

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
