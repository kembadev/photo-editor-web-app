import { DIRECTION } from '../consts.ts'

import { getNestedArrayFromImageBytes } from '../helpers/orderingArray.ts'

interface ImageRotatedType {
  imageBytes: Uint8Array;
  canvasWidth: number;
  canvasHeight: number;
  direction: DIRECTION
}

export function getRotatedImageBytes ({ imageBytes, canvasWidth, canvasHeight, direction }: ImageRotatedType) {
  const imageBytesMatrix = getNestedArrayFromImageBytes({ imageBytes, canvasWidth })

  const rotatedImageBytesMatrix: number[][][] = []
  if (direction === DIRECTION.LEFT) {
    for (let pixelIndex = canvasWidth - 1; pixelIndex >= 0; pixelIndex--) {
      const newRowOfPixels = []
      for (let rowIndex = 0; rowIndex < canvasHeight; rowIndex++) {
        // take the nth pixel from each row and get it into newRowOfPixels
        newRowOfPixels.push(imageBytesMatrix[rowIndex][pixelIndex])
      }

      rotatedImageBytesMatrix.push(newRowOfPixels)
    }
  } else {
    for (let pixelIndex = 0; pixelIndex < canvasWidth; pixelIndex++) {
      const newRowOfPixels = []
      for (let rowIndex = canvasHeight - 1; rowIndex >= 0; rowIndex--) {
        newRowOfPixels.push(imageBytesMatrix[rowIndex][pixelIndex])
      }

      rotatedImageBytesMatrix.push(newRowOfPixels)
    }
  }

  return new Uint8Array(rotatedImageBytesMatrix.flat(2))
}
