import './ImagePreview.css'

import { useEffect, useState } from 'react'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'

interface ImagePreviewProps {
  isModalOpened: boolean
}

export function ImagePreview ({ isModalOpened }: ImagePreviewProps) {
  const [imgPreviewSrc, setImgPreviewSrc] = useState('')

  const { offscreenCanvas, offscreenCanvasImageData } = useOffscreenCanvas()

  useEffect(() => {
    if (!offscreenCanvasImageData ||
      !offscreenCanvas.current ||
      !isModalOpened) return

    offscreenCanvas.current.convertToBlob({ type: 'image/webp', quality: 0.8 })
      .then(blob => {
        const blobURL = URL.createObjectURL(blob)
        setImgPreviewSrc(blobURL)
      })
      .catch(err => console.error(err))
  }, [offscreenCanvas, offscreenCanvasImageData, isModalOpened])

  return (
    <section className='download-modal__image-preview'>
      <img
        className='image-preview-tiny'
        src={imgPreviewSrc}
        alt='image_preview'
      />
      <div className='image-preview-wider__container'>
        <img src={imgPreviewSrc} />
      </div>
    </section>
  )
}
