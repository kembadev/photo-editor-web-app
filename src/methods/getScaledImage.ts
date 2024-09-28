import { getCanvas } from '../common/helpers/getCanvas.ts'
import { getImageDataFromContext } from './getImageData.ts'

export function getScaledCanvas (imageData: ImageData, scale: number) {
  const { width, height } = imageData

  const scaledWidth = Math.floor(width * scale)
  const scaledHeight = Math.floor(height * scale)

  const { canvas, ctx } = getCanvas(imageData, (canvas, ctx) => {
    if (scale <= 0 || scale === 1) return

    canvas.width = scaledWidth
    canvas.height = scaledHeight

    if (scale < 0.5 || scale > 2) {
      ctx.imageSmoothingQuality = 'high'
    } else {
      ctx.imageSmoothingQuality = 'medium'
    }

    ctx.scale(scale, scale)
  })

  return { canvas, ctx, scaledWidth, scaledHeight }
}

export function getScaledImageData (imageData: ImageData, scale: number) {
  const { ctx, scaledWidth, scaledHeight } = getScaledCanvas(imageData, scale)

  const scaledImageData = getImageDataFromContext({ ctx, width: scaledWidth, height: scaledHeight })

  return scaledImageData
}
