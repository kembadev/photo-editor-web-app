import { type Zoom } from '../hooks/useZoom.ts'

import { ImageError } from '../error-handling/ImageError.ts'

interface RestOfPropsOnClippedImageBytes {
  zoom: Zoom;
  UICanvasWidth: number;
  UICanvasHeight: number;
}

export function getRestOfPropsOnClippedImageBytes ({
  zoom,
  UICanvasWidth,
  UICanvasHeight
}: RestOfPropsOnClippedImageBytes) {
  const { level: currentZoomLevel, pointerPosition: currentPointerPosition } = zoom

  const widthOfImgToCut = UICanvasWidth * currentZoomLevel
  const heightOfImgToCut = UICanvasHeight * currentZoomLevel

  const sx = currentPointerPosition === 'center'
    ? (widthOfImgToCut - UICanvasWidth) / 2
    : currentPointerPosition.x * (currentZoomLevel - 1)

  const sy = currentPointerPosition === 'center'
    ? (heightOfImgToCut - UICanvasHeight) / 2
    : currentPointerPosition.y * (currentZoomLevel - 1)

  const isFinalWidthOutOfBounds = UICanvasWidth + sx > widthOfImgToCut
  const isFinalHeightOutOfBounds = UICanvasHeight + sy > heightOfImgToCut

  if (isFinalWidthOutOfBounds || isFinalHeightOutOfBounds) {
    throw new ImageError(`
      ${isFinalWidthOutOfBounds ? 'UICanvasWidth' : 'UICanvasHeight'} is out of bounds.
    `)
  }

  return {
    widthOfImgToCut,
    heightOfImgToCut,
    requirements: {
      finalWidth: UICanvasWidth,
      finalHeight: UICanvasHeight,
      fromCorner: { sx, sy }
    }
  }
}
