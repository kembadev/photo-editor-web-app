import { getCanvas } from '../common/helpers/getCanvas.ts'

export function getScaledCanvas (imageData: ImageData, scale: number) {
  const { width, height } = imageData

  const scaledWidth = Math.floor(width * scale)
  const scaledHeight = Math.floor(height * scale)

  const { canvas, ctx } = getCanvas(imageData, (canvas, ctx) => {
    canvas.width = scaledWidth
    canvas.height = scaledHeight

    ctx.imageSmoothingQuality = 'high'
    ctx.scale(scale, scale)
  })

  return { canvas, ctx, scaledWidth, scaledHeight }
}

export function getScaledImageData (imageData: ImageData, scale: number) {
  const { ctx, scaledWidth, scaledHeight } = getScaledCanvas(imageData, scale)

  const scaledImageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight)

  return { scaledImageData, scaledWidth, scaledHeight }
}
