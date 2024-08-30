import { DIRECTION } from '../consts.ts'

import { getImageBytes } from './getImageBytes.ts'

import { getCanvas } from '../helpers/getCanvas.ts'

interface RotatedImageBytes {
  imageBytes: Uint8Array;
  canvasWidth: number;
  canvasHeight: number;
  direction: DIRECTION
}

export function getRotatedImageBytes ({ imageBytes, canvasWidth, canvasHeight, direction }: RotatedImageBytes) {
  const { ctx } = getCanvas({
    imageBytes,
    canvasWidth,
    canvasHeight
  }, (canvas, ctx) => {
    canvas.width = canvasHeight
    canvas.height = canvasWidth

    if (direction === DIRECTION.RIGHT) {
      ctx.translate(canvasHeight, 0)
      ctx.rotate(Math.PI / 2)
    } else {
      ctx.translate(0, canvasWidth)
      ctx.rotate(-Math.PI / 2)
    }
  })

  return getImageBytes({
    ctx,
    canvasWidth: canvasHeight,
    canvasHeight: canvasWidth
  }) as Uint8Array
}
