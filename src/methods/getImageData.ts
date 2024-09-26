import { ImageError } from '../error-handling/ImageError.ts'

interface GetImageDataProps {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  width: number;
  height: number
}

export type GetImageDataReturnValue = ImageData | ImageError | undefined

export function getImageDataFromContext ({ ctx, width, height }: GetImageDataProps): GetImageDataReturnValue {
  try {
    const imageData = ctx.getImageData(0, 0, width, height)
    return imageData
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === 'SecurityError') {
        return new ImageError('Cannot get ImageData due to security reasons.')
      }

      return new ImageError(`@param ${width === 0 ? 'width' : 'height'} cannot be zero.`)
    }
  }
}
