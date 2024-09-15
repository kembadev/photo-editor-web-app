import { type Message } from '../../dedicated-workers/download.ts'

import { FormEvent, useCallback, useState } from 'react'
import { useErrorMessage } from '../../common/hooks/useErrorMessage.ts'
import { useOffscreenCanvas } from '../Canvas/useOffscreenCanvas.ts'

import { getImageBytes } from '../../methods/getImageBytes.ts'
import { getInternetConnectionStatus } from '../../common/helpers/NetworkStatus.ts'

import DownloadWorker from '../../dedicated-workers/download.ts?worker'

interface DownloadImageFormConfig {
  scale?: number;
  name?: string;
  format?: string
}

export function useDownloadImage () {
  const [isDownloading, setIsDownloading] = useState(false)
  const {
    errorMessage: downloadError,
    updateErrorMessage: updateDownloadError
  } = useErrorMessage()

  const { offscreenCanvas, offscreenCanvasContext2D } = useOffscreenCanvas()

  const handleOnSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isDownloading ||
      !offscreenCanvas.current ||
      !offscreenCanvasContext2D.current) return

    const form = e.target as HTMLFormElement

    const formObject = Object.fromEntries(new FormData(form)) as DownloadImageFormConfig
    const { scale, name, format } = formObject

    const dispatchDownloadError = (msg: string) => {
      updateDownloadError(msg)

      setTimeout(() => {
        updateDownloadError(null)
      }, 5000)
    }

    if (!scale || !name || !format) {
      if (name === '') return console.error('Filename required.')

      dispatchDownloadError('Unexpected error.')
      return
    }

    if (isNaN(scale)) return console.error('Error on scale input.')

    setIsDownloading(true)

    console.info('Downloading image...')

    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvas.current

    const imageBytes = getImageBytes({
      ctx: offscreenCanvasContext2D.current,
      canvasWidth: offscreenCanvasWidth,
      canvasHeight: offscreenCanvasHeight
    }) as Uint8Array

    const buffer = imageBytes.buffer

    const message: Message = {
      buffer,
      canvasWidth: offscreenCanvasWidth,
      canvasHeight: offscreenCanvasHeight,
      MIMEType: `image/${format}`,
      scaling: scale
    }

    const worker = new DownloadWorker({ name: 'DOWNLOAD_WORKER' })

    worker.postMessage(message, [buffer])

    worker.onmessage = (e: MessageEvent<Blob | string>) => {
      if (!(e.data instanceof Blob)) {
        worker.terminate()
        setIsDownloading(false)

        dispatchDownloadError(e.data)
        return
      }

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

      getInternetConnectionStatus()
        .then(ok => {
          if (!ok) {
            dispatchDownloadError('No internet connection.')
            return
          }

          dispatchDownloadError('Download failed.')

          console.error('Download failed.')
        })
        .finally(() => setIsDownloading(false))
    }
  }, [isDownloading, offscreenCanvas, offscreenCanvasContext2D, updateDownloadError])

  return { handleOnSubmit, isDownloading, downloadError }
}
