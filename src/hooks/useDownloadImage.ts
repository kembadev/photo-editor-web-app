import { FormEvent, useCallback, useState } from 'react'
import { useOffscreenCanvas } from './useOffscreenCanvas.ts'

import { getScalingImageBytes } from '../methods/getScalingImageBytes.ts'
import { getInternetConnectionStatus } from '../utils/NetworkStatus.ts'

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

    const {
      scalingImageBytes,
      scalingWidth,
      scalingHeight
    } = getScalingImageBytes({
      imageBytes: offscreenCanvasImageBytes,
      canvasWidth: offscreenCanvasWidth,
      canvasHeight: offscreenCanvasHeight,
      scaling: scale
    })

    console.info('Downloading image...')

    const offscreen = new OffscreenCanvas(scalingWidth, scalingHeight)

    const worker = new DownloadWorker({
      name: 'DOWNLOAD_WORKER'
    })

    const dispatchDownloadError = (msg: string) => {
      setDownloadError(msg)

      setTimeout(() => {
        setDownloadError(null)
      }, 5000)
    }

    if (!(scalingImageBytes instanceof Uint8Array)) {
      worker.terminate()
      setIsDownloading(false)

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

      getInternetConnectionStatus()
        .then(ok => {
          if (!ok) {
            dispatchDownloadError('No internet connection.')
            return
          }

          console.error('Download failed.')
        })
    }
  }, [isDownloading, offscreenCanvas, offscreenCanvasImageBytes])

  return { handleOnSubmit, isDownloading, downloadError }
}
