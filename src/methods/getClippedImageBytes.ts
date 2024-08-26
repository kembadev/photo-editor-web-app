import { type CanvasAcceptedMimeTypes } from '../consts.ts'

import { imageBytes2BlobURL } from '../helpers/imageBytes2BlobURL.ts'
import { getImageBytes } from './getImageBytes.ts'

interface ClippedImageBytes {
  imageBytes: Uint8Array;
  imgWidth: number;
  imgHeight: number;
  MIMEType?: CanvasAcceptedMimeTypes;
  quality?: number;
  desiredDimensionsList: { desiredWidth: number; desiredHeight: number }[]
}

export interface ClippedImageBytesResponse {
  dimensions: { width: number; height: number };
  imageBytes: Uint8Array
}

export function getClippedImageBytes ({
  imageBytes,
  imgWidth,
  imgHeight,
  MIMEType = 'image/webp',
  quality = 0.85,
  desiredDimensionsList
}: ClippedImageBytes) {
  const imgSrc = imageBytes2BlobURL({
    imageBytes,
    imgWidth,
    imgHeight,
    MIMEType,
    quality
  })

  const imgElement = document.createElement('img')
  imgElement.src = imgSrc

  const listenerController = new AbortController()

  const onLoadImage = (res: (value: ClippedImageBytesResponse[]) => void) => {
    const clippedImageBytesList: ClippedImageBytesResponse[] = []

    for (const { desiredWidth, desiredHeight } of desiredDimensionsList) {
      const offscreen = new OffscreenCanvas(desiredWidth, desiredHeight)
      const offscreenContext = offscreen.getContext('2d')!

      const sx = (imgWidth - desiredWidth) / 2
      const sy = (imgHeight - desiredHeight) / 2

      offscreenContext.drawImage(imgElement, sx, sy, desiredWidth, desiredHeight, 0, 0, desiredWidth, desiredHeight)

      const clippedImageBytes = getImageBytes({
        ctx: offscreenContext,
        canvasWidth: desiredWidth,
        canvasHeight: desiredHeight
      }) as Uint8Array

      clippedImageBytesList.push({
        dimensions: {
          width: desiredWidth,
          height: desiredHeight
        },
        imageBytes: clippedImageBytes
      })
    }

    res(clippedImageBytesList)

    listenerController.abort()
    URL.revokeObjectURL(imgSrc)
    imgElement.remove()
  }

  return new Promise<ClippedImageBytesResponse[]>(resolve => {
    imgElement.addEventListener('load', () => {
      onLoadImage(resolve)
    }, { signal: listenerController.signal })
  })
}
