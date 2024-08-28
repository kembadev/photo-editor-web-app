import { type PointerPosition } from '../hooks/useZoom.ts'

import { ImageError } from '../error-handling/ImageError.ts'

interface RestOfPropsOnClippedImageBytes {
  zoomLevel: number;
  widthOfImgToCut: number;
  heightOfImgToCut: number;
  UICanvasWidth: number;
  UICanvasHeight: number;
  pointerPosition: PointerPosition
}

export function getRestOfPropsOnClippedImageBytes ({
  zoomLevel,
  widthOfImgToCut,
  heightOfImgToCut,
  UICanvasWidth,
  UICanvasHeight,
  pointerPosition
}: RestOfPropsOnClippedImageBytes) {
  const sx = pointerPosition === 'center'
    ? (widthOfImgToCut - UICanvasWidth) / 2
    : pointerPosition.x * (zoomLevel - 1)

  const sy = pointerPosition === 'center'
    ? (heightOfImgToCut - UICanvasHeight) / 2
    : pointerPosition.y * (zoomLevel - 1)

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
    listOfRequirements: [{
      finalWidth: UICanvasWidth,
      finalHeight: UICanvasHeight,
      fromCorner: { sx, sy }
    }]
  }
}
