import { getImageBytes } from './getImageBytes.ts'

import { getCanvas } from '../common/helpers/getCanvas.ts'

interface InvertedImageBytes {
  imageBytes: Uint8Array;
  canvasWidth: number
}

export function getInvertedImageBytes ({ imageBytes, canvasWidth }: InvertedImageBytes) {
  const canvasHeight = imageBytes.length / (canvasWidth * 4)

  const { ctx } = getCanvas({
    imageBytes,
    canvasWidth,
    canvasHeight
  }, (_, ctx) => {
    ctx.setTransform(-1, 0, 0, 1, canvasWidth, 0)
  })

  return getImageBytes({
    ctx,
    canvasWidth,
    canvasHeight
  }) as Uint8Array
}
