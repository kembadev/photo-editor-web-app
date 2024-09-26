import { getCanvas } from '../common/helpers/getCanvas.ts'

export function getInvertedImageData (imageData: ImageData) {
  const { width, height } = imageData
  const { ctx } = getCanvas(imageData, (_, ctx) => {
    ctx.setTransform(-1, 0, 0, 1, width, 0)
  })

  return ctx.getImageData(0, 0, width, height)
}
