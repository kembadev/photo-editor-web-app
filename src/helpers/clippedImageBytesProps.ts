import { type PointerPosition } from '../hooks/useZoom.ts'

import { ImageError } from '../error-handling/ImageError.ts'

interface RestOfPropsOnClippedImageBytes {
  widthOfImgToCut: number;
  heightOfImgToCut: number;
  finalWidth: number;
  finalHeight: number;
  pointerPosition: PointerPosition
}

export function getRestOfPropsOnClippedImageBytes ({
  widthOfImgToCut,
  heightOfImgToCut,
  finalWidth,
  finalHeight,
  pointerPosition
}: RestOfPropsOnClippedImageBytes) {
  const sxCentered = (widthOfImgToCut - finalWidth) / 2
  const sx = pointerPosition === 'center'
    ? sxCentered
    : sxCentered // bad

  const syCentered = (heightOfImgToCut - finalHeight) / 2
  const sy = pointerPosition === 'center'
    ? syCentered
    : syCentered // bad

  const isFinalWidthOutOfBounds = finalWidth + sx > widthOfImgToCut
  const isFinalHeightOutOfBounds = finalHeight + sy > heightOfImgToCut

  if (isFinalWidthOutOfBounds || isFinalHeightOutOfBounds) {
    throw new ImageError(`
      ${isFinalWidthOutOfBounds ? 'finalWidth' : 'finalHeight'} is out of bounds.
    `)
  }

  const fromCorner = { sx, sy }

  return {
    finalWidth,
    finalHeight,
    fromCorner
  }
}
