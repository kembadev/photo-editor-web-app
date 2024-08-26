import { FormEvent, useCallback, useState } from 'react'
import { useOffscreenCanvas } from './useOffscreenCanvas.ts'

import { getImageScaler } from '../methods/getImageScaler.ts'

import DownloadWorker from '../dedicated-workers/download.ts?worker'

interface DownloadImageFormConfig {
  scale?: number;
  name?: string;
  format?: string
}

export function useDownloadImage () {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const { offscreenCanvas, offscreenCanvasImageBytes } = useOffscreenCanvas()

  const handleOnSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isDownloading) return

    const form = e.target as HTMLFormElement

    const formObject = Object.fromEntries(new FormData(form)) as DownloadImageFormConfig
    const { scale, name, format } = formObject

    if (!scale || !name || !format) {
      return name === ''
        ? console.error('Filename required.')
        : console.error('Unexpected error.')
    }

    setIsDownloading(true)

    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvas.current!

    const { scale: getImageScaling, clearCache } = getImageScaler({
      imageBytes: offscreenCanvasImageBytes,
      imgWidth: offscreenCanvasWidth,
      imgHeight: offscreenCanvasHeight
    })

    console.info('Downloading image...')

    ;(async () => {
      const { scalingImageBytes } = await getImageScaling(scale)
      clearCache()

      const imgScalingWidth = offscreenCanvasWidth * scale
      const imgScalingHeight = offscreenCanvasHeight * scale

      const offscreen = new OffscreenCanvas(imgScalingWidth, imgScalingHeight)

      const worker = new DownloadWorker({
        name: 'DOWNLOAD_WORKER'
      })

      if (!(scalingImageBytes instanceof Uint8Array)) {
        worker.terminate()
        setIsDownloading(false)

        const dispatchDownloadError = (msg: string) => {
          setDownloadError(msg)

          setTimeout(() => {
            setDownloadError(null)
          }, 5000)
        }

        if (scalingImageBytes === undefined) {
          dispatchDownloadError('Something went wrong. If the problem persists, it may be due to security reasons.')
        } else {
          dispatchDownloadError('The image is too large to download.')
        }

        return
      }

      const buffer = scalingImageBytes.buffer
      const MIMEType = `image/${format}`

      worker.postMessage({ offscreen, buffer, MIMEType }, [offscreen, buffer])

      worker.onmessage = (e: MessageEvent<Blob>) => {
        const blob = e.data
        const blobURL = URL.createObjectURL(blob)

        const anchor = document.createElement('a')
        anchor.href = blobURL
        anchor.download = name
        anchor.click()

        URL.revokeObjectURL(blobURL)
        worker.terminate()

        setIsDownloading(false)
      }

      worker.onerror = () => {
        worker.terminate()
        setIsDownloading(false)

        console.error('Download failed.')
      }
    })()
  }, [isDownloading, offscreenCanvas, offscreenCanvasImageBytes])

  return { handleOnSubmit, isDownloading, downloadError }
}
