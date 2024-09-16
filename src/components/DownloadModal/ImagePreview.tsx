import './ImagePreview.css'

import { useEffect, useRef } from 'react'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'

import { getImageResize } from '../../methods/getImageResize.ts'

export function ImagePreview () {
  const { offscreenCanvas, offscreenCanvasImageBytes } = useOffscreenCanvas()

  const tinyImagePreview = useRef<HTMLCanvasElement>(null)
  const imagePreview = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!offscreenCanvas.current ||
      !tinyImagePreview.current ||
      !imagePreview.current ||
      offscreenCanvasImageBytes.byteLength === 0) return

    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvas.current

    const { scaleX: tinyScaleX, scaleY: tinyScaleY } = getImageResize({
      originalWidth: offscreenCanvasWidth,
      originalHeight: offscreenCanvasHeight,
      containerHeight: 45,
      containerWidth: 45
    })

    tinyImagePreview.current.width = offscreenCanvasWidth * tinyScaleX
    tinyImagePreview.current.height = offscreenCanvasHeight * tinyScaleY

    const tinyCtx = tinyImagePreview.current.getContext('2d')!

    tinyCtx.scale(tinyScaleX, tinyScaleY)
    tinyCtx.drawImage(offscreenCanvas.current, 0, 0)

    // ------

    const { scaleX, scaleY } = getImageResize({
      originalWidth: offscreenCanvasWidth,
      originalHeight: offscreenCanvasHeight,
      containerHeight: 130,
      containerWidth: 130
    })

    imagePreview.current.width = offscreenCanvasWidth * scaleX
    imagePreview.current.height = offscreenCanvasHeight * scaleY

    const ctx = imagePreview.current.getContext('2d')!

    ctx.scale(scaleX, scaleY)
    ctx.drawImage(offscreenCanvas.current, 0, 0)
  }, [offscreenCanvas, offscreenCanvasImageBytes])

  return (
    <section className='download-modal__image-preview'>
      <canvas ref={tinyImagePreview} style={{ boxShadow: '0 0 2px grey' }} />
      <div className='image-preview-wider'>
        <canvas ref={imagePreview} />
      </div>
    </section>
  )
}
