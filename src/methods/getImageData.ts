import { ImageError, ImageMemoryError, ImageSecurityError } from '../error-handling/ImageError.ts'

interface GetImageDataProps {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  width: number;
  height: number
}

export function getImageDataFromContext ({ ctx, width, height }: GetImageDataProps) {
  try {
    const imageData = ctx.getImageData(0, 0, width, height)
    return imageData
  } catch (err) {
    if (err instanceof RangeError) {
      return new ImageMemoryError('The image is out of memory.')
    }

    if (err instanceof DOMException) {
      if (err.name === 'SecurityError') {
        return new ImageSecurityError('Cannot get ImageData due to security reasons.')
      }

      return new ImageError(`@param ${width <= 0 ? 'width' : 'height'} cannot be less than or equal to zero.`)
    }
  }
}
