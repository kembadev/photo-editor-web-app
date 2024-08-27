import { type CanvasAcceptedMimeTypes } from '../consts.ts'

import { imageBytes2BlobURL } from '../helpers/imageBytes2BlobURL.ts'
import { getImageBytes } from './getImageBytes.ts'

interface ClippedImageBytes {
  imageBytesToCut: Uint8Array;
  widthOfImgToCut: number;
  heightOfImgToCut: number;
  MIMEType?: CanvasAcceptedMimeTypes;
  quality?: number;
  listOfRequirements: {
    finalWidth: number;
    finalHeight: number;
    fromCorner: { sx: number; sy: number }
  }[]
}

export interface ClippedImageBytesResponse {
  dimensions: { width: number; height: number };
  imageBytes: Uint8Array
}

export function getClippedImageBytes ({
  imageBytesToCut,
  widthOfImgToCut,
  heightOfImgToCut,
  MIMEType = 'image/webp',
  quality = 0.85,
  listOfRequirements
}: ClippedImageBytes) {
  const imgSrc = imageBytes2BlobURL({
    imageBytes: imageBytesToCut,
    imgWidth: widthOfImgToCut,
    imgHeight: heightOfImgToCut,
    MIMEType,
    quality
  })

  const imgElement = document.createElement('img')
  imgElement.src = imgSrc

  const listenerController = new AbortController()

  const onLoadImage = (res: (value: ClippedImageBytesResponse[]) => void) => {
    const clippedImageBytesList: ClippedImageBytesResponse[] = []

    for (const requirements of listOfRequirements) {
      const {
        finalWidth,
        finalHeight,
        fromCorner
      } = requirements

      const offscreen = new OffscreenCanvas(finalWidth, finalHeight)
      const offscreenContext = offscreen.getContext('2d')!

      const { sx, sy } = fromCorner

      offscreenContext.drawImage(imgElement, sx, sy, finalWidth, finalHeight, 0, 0, finalWidth, finalHeight)

      const clippedImageBytes = getImageBytes({
        ctx: offscreenContext,
        canvasWidth: finalWidth,
        canvasHeight: finalHeight
      }) as Uint8Array

      clippedImageBytesList.push({
        dimensions: {
          width: finalWidth,
          height: finalHeight
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
