import { getScaledCanvas } from '../methods/getScaledImage.ts'
import { getImageBytes } from '../methods/getImageBytes.ts'

import { ImageMemoryError, ImageError } from '../error-handling/ImageError.ts'

export interface Message {
  buffer: ArrayBufferLike;
  canvasWidth: number;
  canvasHeight: number;
  scaling: number;
  MIMEType: string
}

onmessage = async (e: MessageEvent<Message>) => {
  const { buffer, canvasWidth, canvasHeight, scaling, MIMEType } = e.data

  const imageBytes = new Uint8Array(buffer)

  const { canvas, ctx, scalingWidth, scalingHeight } = getScaledCanvas({
    imageBytes,
    canvasWidth,
    canvasHeight,
    scaling
  })

  canvas.convertToBlob({ type: MIMEType, quality: 1 })
    .then(blob => {
      const finalImageBytes = getImageBytes({
        ctx,
        canvasWidth: scalingWidth,
        canvasHeight: scalingHeight
      })

      if (finalImageBytes instanceof Uint8Array) {
        const isOriginalImageBlack = imageBytes.every(channel => channel === 0)
        const isFinalImageBlack = finalImageBytes.every(channel => channel === 0)

        if (!isOriginalImageBlack && isFinalImageBlack) {
          throw new ImageMemoryError('The image is too large to process so the download went wrong.')
        }
      }

      postMessage(blob)
    })
    .catch(e => {
      if (!(e instanceof Error)) {
        return postMessage('Something went wrong while downloading.')
      }

      if (e.name === 'IndexSizeError') {
        return postMessage('The image is too large to download.')
      }

      if (e.name === 'SecurityError') {
        return postMessage('The image cannot be download due to security reasons.')
      }

      if (e instanceof ImageError) {
        return postMessage(e.message)
      }

      postMessage('The image cannot be downloaded.')
    })
}
