import { getImageBytes } from './getImageBytes.ts'

import { getCanvas } from '../common/helpers/getCanvas.ts'

interface ClippedImageBytes {
  imageBytesToCut: Uint8Array;
  widthOfImgToCut: number;
  heightOfImgToCut: number;
  requirements: {
    finalWidth: number;
    finalHeight: number;
    fromCorner: { sx: number; sy: number }
  }
}

export function getClippedImageBytes ({
  imageBytesToCut,
  widthOfImgToCut,
  heightOfImgToCut,
  requirements
}: ClippedImageBytes) {
  const { finalWidth, finalHeight, fromCorner } = requirements
  const { sx, sy } = fromCorner

  const { ctx } = getCanvas({
    imageBytes: imageBytesToCut,
    canvasWidth: widthOfImgToCut,
    canvasHeight: heightOfImgToCut
  }, (canvas, ctx) => {
    canvas.width = finalWidth
    canvas.height = finalHeight

    ctx.translate(-sx, -sy)
  })

  return getImageBytes({
    ctx,
    canvasWidth: finalWidth,
    canvasHeight: finalHeight
  }) as Uint8Array
}
