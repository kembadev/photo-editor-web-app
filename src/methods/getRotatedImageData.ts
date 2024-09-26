import { DIRECTION } from '../consts.ts'

import { getCanvas } from '../common/helpers/getCanvas.ts'

export function getRotatedImageData (imageData: ImageData, direction: DIRECTION) {
  const { width, height } = imageData

  const { ctx } = getCanvas(imageData, (canvas, ctx) => {
    canvas.width = height
    canvas.height = width

    if (direction === DIRECTION.RIGHT) {
      ctx.translate(height, 0)
      ctx.rotate(Math.PI / 2)
    } else {
      ctx.translate(0, width)
      ctx.rotate(-Math.PI / 2)
    }
  })

  return ctx.getImageData(0, 0, height, width)
}
