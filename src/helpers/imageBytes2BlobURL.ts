import { type CanvasAcceptedMimeTypes, CANVAS_ACCEPTED_MIME_TYPES } from '../consts.ts'

import { dataURI2Blob } from './dataURI2Blob.ts'
import { ImageError } from '../error-handling/ImageError.ts'

interface BlobUrlFromImageBytes {
  imageBytes: Uint8Array;
  imgWidth: number;
  imgHeight: number;
  MIMEType?: CanvasAcceptedMimeTypes;
  quality?: number
}

export function imageBytes2BlobURL ({
  imageBytes,
  imgWidth,
  imgHeight,
  MIMEType = 'image/png',
  quality = 1
}: BlobUrlFromImageBytes) {
  const isMIMETypeInvalid = !CANVAS_ACCEPTED_MIME_TYPES.some(
    mimeType => mimeType.toLowerCase() === MIMEType.toLowerCase()
  )

  if (isMIMETypeInvalid) {
    ImageError.ThrowInvalidEncoding(
      CANVAS_ACCEPTED_MIME_TYPES.map(type => type),
      'Invalid DataURI MIMEType'
    )
  }

  const canvasMock = document.createElement('canvas')
  canvasMock.width = imgWidth
  canvasMock.height = imgHeight

  const canvasMockContext = canvasMock.getContext('2d')!
  const canvasMockImageData = canvasMockContext.createImageData(imgWidth, imgHeight)
  canvasMockImageData.data.set(imageBytes)
  canvasMockContext.putImageData(canvasMockImageData, 0, 0)

  const desiredQuality = quality > 1
    ? 1
    : quality < 0
      ? 0
      : quality

  const imgSrc = URL.createObjectURL(
    dataURI2Blob(canvasMock.toDataURL(MIMEType, desiredQuality))
  )

  return imgSrc
}
