import { type Zoom } from '../hooks/useZoom.ts'

import { ImageError } from '../error-handling/ImageError.ts'

interface RestOfPropsOnClippedImageBytes {
  zoom: Zoom;
  prevZoom: Zoom;
  prevFromCorner: { sx: number, sy: number };
  UICanvasWidth: number;
  UICanvasHeight: number;
}

export function getRestOfPropsOnClippedImageBytes ({
  zoom,
  prevZoom,
  prevFromCorner,
  UICanvasWidth,
  UICanvasHeight
}: RestOfPropsOnClippedImageBytes) {
  const { level: currentZoomLevel, pointerPosition: currentPointerPosition } = zoom
  const { level: prevZoomLevel } = prevZoom

  const widthOfImgToCut = UICanvasWidth * currentZoomLevel
  const heightOfImgToCut = UICanvasHeight * currentZoomLevel

  const centeredSX = (widthOfImgToCut - UICanvasWidth) / 2
  const centeredSY = (heightOfImgToCut - UICanvasHeight) / 2

  let currentSX, currentSY

  if (currentPointerPosition === 'center') {
    currentSX = centeredSX
    currentSY = centeredSY
  } else {
    currentSX = prevFromCorner.sx + (currentPointerPosition.x * (currentZoomLevel - prevZoomLevel))
    currentSY = prevFromCorner.sy + (currentPointerPosition.y * (currentZoomLevel - prevZoomLevel))
  }

  const sx = Math.max(0, Math.min(currentSX, widthOfImgToCut - UICanvasWidth))
  const sy = Math.max(0, Math.min(currentSY, heightOfImgToCut - UICanvasHeight))

  const isFinalWidthOutOfBounds = sx + UICanvasWidth > widthOfImgToCut
  const isFinalHeightOutOfBounds = sy + UICanvasHeight > heightOfImgToCut

  if (isFinalWidthOutOfBounds || isFinalHeightOutOfBounds) {
    throw new ImageError(`
      ${isFinalWidthOutOfBounds ? 'UICanvasWidth' : 'UICanvasHeight'} is out of bounds. currentZoomLevel < 1 => ${currentZoomLevel < 1}
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
