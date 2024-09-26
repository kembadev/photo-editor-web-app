import { getCanvas } from '../common/helpers/getCanvas.ts'

interface ClippedImageDataProps {
  imageDataToCut: ImageData;
  requirements: {
    finalWidth: number;
    finalHeight: number;
    fromCorner: { sx: number; sy: number }
  }
}

export function getClippedImageData ({ imageDataToCut, requirements }: ClippedImageDataProps) {
  const { finalWidth, finalHeight, fromCorner } = requirements
  const { sx, sy } = fromCorner

  const { ctx } = getCanvas(imageDataToCut, (canvas, ctx) => {
    canvas.width = finalWidth
    canvas.height = finalHeight

    ctx.translate(-sx, -sy)
  })

  return ctx.getImageData(0, 0, finalWidth, finalHeight)
}
