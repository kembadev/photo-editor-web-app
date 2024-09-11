import { getImageBytes } from './getImageBytes.ts'

import { getCanvas } from '../common/helpers/getCanvas.ts'

interface ImageScaler {
  imageBytes: Uint8Array;
  canvasWidth: number;
  canvasHeight: number;
  scaling: number
}

export function getScaledCanvas ({ imageBytes, canvasWidth, canvasHeight, scaling }: ImageScaler) {
  const scalingWidth = canvasWidth * scaling
  const scalingHeight = canvasHeight * scaling

  const { canvas, ctx } = getCanvas({
    imageBytes,
    canvasWidth,
    canvasHeight
  }, (canvas, ctx) => {
    canvas.width = scalingWidth
    canvas.height = scalingHeight

    ctx.imageSmoothingQuality = 'high'
    ctx.scale(scaling, scaling)
  })

  return { canvas, ctx, scalingWidth, scalingHeight }
}

export function getScalingImageBytes ({ imageBytes, canvasWidth, canvasHeight, scaling }: ImageScaler) {
  const { ctx, scalingWidth, scalingHeight } = getScaledCanvas({
    imageBytes,
    canvasWidth,
    canvasHeight,
    scaling
  })

  const scalingImageBytes = getImageBytes({
    ctx,
    canvasWidth: scalingWidth,
    canvasHeight: scalingHeight
  })

  return { scalingImageBytes, scalingWidth, scalingHeight }
}
