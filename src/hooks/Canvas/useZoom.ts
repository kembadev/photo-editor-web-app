import { AVAILABLE_TOOLS } from '../../components/Tools/tools.tsx'

import { ZOOM_LIMITS } from '../../consts.ts'

import { TouchEvent, useCallback, useEffect, useRef, useState, WheelEvent } from 'react'
import { useUICanvas } from './useUICanvas.ts'
import { usePosition } from '../../common/hooks/usePosition.ts'

import { getScaledImageData } from '../../methods/getScaledImage.ts'
import { getClippedImageData } from '../../methods/getClippedImageData.ts'
import { dispatchWarning } from '../../methods/dispatchWarning.ts'
import { ImageError } from '../../error-handling/ImageError.ts'

interface UseZoomProps {
  currentToolSelected: AVAILABLE_TOOLS
}

type Position = { x: number; y: number }

type PointerPosition = Position | undefined

interface Zoom {
  level: number;
  pointerPosition: PointerPosition
}

interface ChangeZoom {
  pointerPosition: PointerPosition;
  n: number
}

const changeZoomDefaultProps: ChangeZoom = { pointerPosition: undefined, n: 0.2 }

type PrevTouchesPosition = [
  prevTouch1: undefined,
  prevTouch2: undefined
] | [
  prevTouch1: Position,
  prevTouch2: Position
]

interface GetSourcePositionOnClippedImageDataProps {
  widthOfImageToCut: number;
  heightOfImageToCut: number
}

export function useZoom ({ currentToolSelected }: UseZoomProps) {
  const [zoom, setZoom] = useState<Zoom>({ level: 1, pointerPosition: undefined })

  const { UICanvas, UICanvasImageData } = useUICanvas()
  const [transformedImageData, setTransformedImageData] = useState(UICanvasImageData)

  const { getPointerPositionOnUICanvas, getTouchesPositionOnUICanvas } = usePosition()

  const prevZoom = useRef(zoom)
  const prevFromCorner = useRef({ sx: 0, sy: 0 })
  const prevTouchesPosition = useRef<PrevTouchesPosition>([undefined, undefined])

  // fundamental zoom changes

  const restoreZoom = useCallback(() => {
    setZoom({
      level: 1,
      pointerPosition: undefined
    })
  }, [])

  const doZoom = useCallback(({ pointerPosition, n }: ChangeZoom) => {
    if (!UICanvas.current || currentToolSelected === AVAILABLE_TOOLS.CROP) return

    const { pointerPosition: accumulatedPointerPosition } = zoom

    const desiredZoom = Number((zoom.level + n).toFixed(2))

    const newZoomLevel = desiredZoom > ZOOM_LIMITS.MAX
      ? ZOOM_LIMITS.MAX
      : desiredZoom < ZOOM_LIMITS.MIN
        ? ZOOM_LIMITS.MIN
        : desiredZoom

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    const updatedPointerPosition = pointerPosition ||
      accumulatedPointerPosition ||
      { x: Math.round(UICanvasWidth / 2), y: Math.round(UICanvasHeight / 2) }

    const { x, y } = updatedPointerPosition

    if (x < 0 || y < 0 || x > UICanvasWidth || y > UICanvasHeight) return

    setZoom({
      level: newZoomLevel,
      pointerPosition: updatedPointerPosition
    })
  }, [zoom, UICanvas, currentToolSelected])

  const zoomIn = useCallback(({ pointerPosition, n } = changeZoomDefaultProps) => {
    if (zoom.level === ZOOM_LIMITS.MAX) return

    doZoom({ pointerPosition, n })
  }, [zoom, doZoom])

  const zoomOut = useCallback(({ pointerPosition, n } = changeZoomDefaultProps) => {
    if (zoom.level === ZOOM_LIMITS.MIN) return

    doZoom({ pointerPosition, n: -n })
  }, [zoom, doZoom])

  // set zoom by UIEvents

  const onWheelChange = useCallback((e: WheelEvent<HTMLCanvasElement>) => {
    const pointerPosition = getPointerPositionOnUICanvas(e)

    if (!pointerPosition) return

    const { deltaY } = e

    const n = deltaY * 0.001

    if (deltaY < 0) return zoomIn({ pointerPosition, n: -n })

    zoomOut({ pointerPosition, n })
  }, [zoomIn, zoomOut, getPointerPositionOnUICanvas])

  const onTouchChange = useCallback((e: TouchEvent<HTMLCanvasElement>) => {
    if (!UICanvas.current || e.touches.length !== 2) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    const [touch1, touch2] = getTouchesPositionOnUICanvas(e)!
    const [prevTouch1, prevTouch2] = prevTouchesPosition.current

    let prevX1, prevX2, prevY1, prevY2

    if (!prevTouch1) {
      const centerX = UICanvasWidth / 2
      const centerY = UICanvasHeight / 2

      prevX1 = centerX
      prevX2 = centerX

      prevY1 = centerY
      prevY2 = centerY
    } else {
      prevX1 = prevTouch1.x
      prevX2 = prevTouch2.x

      prevY1 = prevTouch1.y
      prevY2 = prevTouch2.y
    }

    const currentDistance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y)
    const prevDistance = Math.hypot(prevX2 - prevX1, prevY2 - prevY1)

    const distanceChange = Math.abs(currentDistance - prevDistance)
    const sensitivityThreshold = 5

    if (distanceChange < sensitivityThreshold) return

    const isZoomIn = currentDistance > prevDistance

    const pointerPosition = {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2
    }

    const n = 0.15

    if (isZoomIn) {
      zoomIn({ pointerPosition, n })
    } else {
      zoomOut({ pointerPosition, n })
    }

    prevTouchesPosition.current = [touch1, touch2]
  }, [UICanvas, zoomIn, zoomOut, getTouchesPositionOnUICanvas])

  const onTouchStart = useCallback((e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 2) return

    const [touch1, touch2] = getTouchesPositionOnUICanvas(e)!
    prevTouchesPosition.current = [touch1, touch2]
  }, [getTouchesPositionOnUICanvas])

  // update transformedImageData

  const getSourcePositionOnClippedImageData = useCallback(({
    widthOfImageToCut,
    heightOfImageToCut
  }: GetSourcePositionOnClippedImageDataProps) => {
    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData!
    const { level: currentZoomLevel, pointerPosition: currentPointerPosition } = zoom
    const { level: prevZoomLevel } = prevZoom.current

    let currentSX: number, currentSY: number

    if (!currentPointerPosition) {
      currentSX = (widthOfImageToCut - UICanvasWidth) / 2
      currentSY = (heightOfImageToCut - UICanvasHeight) / 2
    } else {
      currentSX = prevFromCorner.current.sx + (currentPointerPosition.x * (currentZoomLevel - prevZoomLevel))
      currentSY = prevFromCorner.current.sy + (currentPointerPosition.y * (currentZoomLevel - prevZoomLevel))
    }

    const sx = Math.max(0, Math.min(currentSX, widthOfImageToCut - UICanvasWidth))
    const sy = Math.max(0, Math.min(currentSY, heightOfImageToCut - UICanvasHeight))

    const isFinalWidthOutOfBounds = sx + UICanvasWidth > widthOfImageToCut
    const isFinalHeightOutOfBounds = sy + UICanvasHeight > heightOfImageToCut

    if (isFinalWidthOutOfBounds || isFinalHeightOutOfBounds) {
      throw new ImageError(`
        ${isFinalWidthOutOfBounds ? 'Final width' : 'Final height'} 
        is out of bounds. ${currentZoomLevel < 1 ? 'The zoom level is less than 1.' : ''}
      `)
    }

    const sourcePosition = { sx, sy }

    prevFromCorner.current = sourcePosition
    prevZoom.current = zoom

    return sourcePosition
  }, [zoom, UICanvasImageData])

  const stopEventPropagation = useCallback((e: UIEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!UICanvasImageData || !UICanvas.current) return

    const scaledImageData = getScaledImageData(UICanvasImageData, zoom.level)

    if (!(scaledImageData instanceof ImageData)) {
      if (scaledImageData === undefined) {
        dispatchWarning({
          message: 'Unexpected error when zooming the image.',
          color: 'yellow'
        })
        return
      }

      dispatchWarning({
        message: 'The image is too large to zoom in further.',
        color: 'yellow'
      })

      return
    }

    const fromCorner = getSourcePositionOnClippedImageData({
      widthOfImageToCut: scaledImageData.width,
      heightOfImageToCut: scaledImageData.height
    })

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData

    const clippedImageData = getClippedImageData({
      imageDataToCut: scaledImageData,
      requirements: {
        finalWidth: UICanvasWidth,
        finalHeight: UICanvasHeight,
        fromCorner
      }
    })

    setTransformedImageData(clippedImageData)

    const canvas = UICanvas.current

    canvas.addEventListener('wheel', stopEventPropagation)
    canvas.addEventListener('touchstart', stopEventPropagation)
    canvas.addEventListener('touchmove', stopEventPropagation)

    return () => {
      canvas.removeEventListener('wheel', stopEventPropagation)
      canvas.removeEventListener('touchstart', stopEventPropagation)
      canvas.removeEventListener('touchmove', stopEventPropagation)
    }
  }, [zoom, UICanvasImageData, UICanvas, getSourcePositionOnClippedImageData, stopEventPropagation])

  return {
    zoom,
    zoomIn,
    zoomOut,
    restoreZoom,
    onWheelChange,
    onTouchStart,
    onTouchChange,
    transformedImageData
  }
}
