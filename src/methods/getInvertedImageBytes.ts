import { getModifiedImageBytes } from '../helpers/getModifiedImageBytes.ts'

interface ImageInvertedType {
  imageBytes: Uint8Array;
  canvasWidth: number
}

export function getInvertedImageBytes ({ imageBytes, canvasWidth }: ImageInvertedType) {
  const invertedImageBytes = getModifiedImageBytes({
    imageBytes,
    imgWidth: canvasWidth
  }, (rowOfPixels) => rowOfPixels.reverse())

  return invertedImageBytes
}
