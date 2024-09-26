import { type AvailableToolsNames } from '../../components/Tools/tools.tsx'

import { ZOOM_LIMITS } from '../../consts.ts'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUICanvas } from './useUICanvas.ts'

import { getScaledImageData } from '../../methods/getScaledImage.ts'
import { getClippedImageData } from '../../methods/getClippedImageData.ts'
import { getModifiedImageBytes } from '../../helpers/Controls/getModifiedImageBytes.ts'

import { ImageError } from '../../error-handling/ImageError.ts'

interface UseZoomProps {
  currentToolSelected: AvailableToolsNames
}

export type Position = { x: number; y: number }

type PointerPosition = Position | 'center'

interface Zoom {
  level: number;
  pointerPosition: PointerPosition
}

interface ChangeZoom {
  pointerPosition: PointerPosition;
  n?: number
}

type PrevTouchesPosition = [
  prevTouch1: 'center',
  prevTouch2: 'center'
] | [
  prevTouch1: Position,
  prevTouch2: Position
]

interface GetTouchesPositionProps {
  e: TouchEvent;
  left: number;
  top: number
}

interface RestOfPropsOnClippedImageBytes {
  zoom: Zoom;
  prevZoom: Zoom;
  prevFromCorner: { sx: number, sy: number };
  UICanvasWidth: number;
  UICanvasHeight: number;
}

const changeZoomDefaultProps: ChangeZoom = { pointerPosition: 'center', n: 0.2 }

export function useZoom ({ currentToolSelected }: UseZoomProps) {
  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasImageData
  } = useUICanvas()

  const [zoom, setZoom] = useState<Zoom>({ level: 1, pointerPosition: 'center' })

  const prevZoom = useRef(zoom)
  const prevFromCorner = useRef({ sx: 0, sy: 0 })
  const prevTouchesPosition = useRef<PrevTouchesPosition>(['center', 'center'])

  const zoomIn = useCallback(({ pointerPosition = 'center', n = 0.2 }: ChangeZoom = changeZoomDefaultProps) => {
    if (currentToolSelected === 'Crop' || zoom.level === ZOOM_LIMITS.MAX) return

    setZoom(prevZoom => {
      const { level } = prevZoom

      const desiredZoom = Number((level + n).toFixed(2))

      const newZoomLevel = desiredZoom > ZOOM_LIMITS.MAX
        ? ZOOM_LIMITS.MAX
        : desiredZoom

      return { level: newZoomLevel, pointerPosition }
    })
  }, [zoom, currentToolSelected])

  const zoomOut = useCallback(({ pointerPosition = 'center', n = 0.2 }: ChangeZoom = changeZoomDefaultProps) => {
    if (currentToolSelected === 'Crop' || zoom.level === ZOOM_LIMITS.MIN) return

    setZoom(prevZoom => {
      const { level } = prevZoom

      const desiredZoom = Number((level - n).toFixed(2))

      const newZoomLevel = desiredZoom < ZOOM_LIMITS.MIN
        ? ZOOM_LIMITS.MIN
        : desiredZoom

      return { level: newZoomLevel, pointerPosition }
    })
  }, [zoom, currentToolSelected])

  const restoreZoom = useCallback(() => {
    setZoom({
      level: 1,
      pointerPosition: 'center'
    })
  }, [])

  const onWheelChange = useCallback((e: WheelEvent) => {
    e.preventDefault()

    if (!UICanvas.current) return

    const { deltaY, clientX, clientY } = e
    const { left, top } = UICanvas.current.getBoundingClientRect()

    const x = clientX - left
    const y = clientY - top

    const pointerPosition = { x, y }

    const n = deltaY * 0.001

    if (deltaY < 0) return zoomIn({ pointerPosition, n: -n })

    zoomOut({ pointerPosition, n })
  }, [zoomIn, zoomOut, UICanvas])

  const getTouchesPosition = useCallback(({ e, left, top }: GetTouchesPositionProps) => {
    const { touches } = e

    const touchesPosition: Position[] = []

    for (const touch of touches) {
      const { clientX, clientY } = touch

      touchesPosition.push({
        x: clientX - left,
        y: clientY - top
      })
    }

    return touchesPosition
  }, [])

  const onTouchChange = useCallback((e: TouchEvent) => {
    e.preventDefault()

    if (!UICanvas.current || e.touches.length !== 2) return

    const { left, top } = UICanvas.current.getBoundingClientRect()
    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    const [touch1, touch2] = getTouchesPosition({ e, left, top })
    const [prevTouch1, prevTouch2] = prevTouchesPosition.current

    let prevX1, prevX2, prevY1, prevY2

    if (prevTouch1 === 'center') {
      const xCentered = UICanvasWidth / 2
      const yCentered = UICanvasHeight / 2

      prevX1 = xCentered
      prevX2 = xCentered

      prevY1 = yCentered
      prevY2 = yCentered
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
  }, [UICanvas, zoomIn, zoomOut, getTouchesPosition])

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (!UICanvas.current || e.touches.length !== 2) return

    const { left, top } = UICanvas.current.getBoundingClientRect()
    const [touch1, touch2] = getTouchesPosition({ e, left, top })
    prevTouchesPosition.current = [touch1, touch2]
  }, [UICanvas, getTouchesPosition])

  const getRestOfPropsOnClippedImageData = useCallback(({
    zoom,
    prevZoom,
    prevFromCorner,
    UICanvasWidth,
    UICanvasHeight
  }: RestOfPropsOnClippedImageBytes) => {
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
        ${isFinalWidthOutOfBounds ? 'Final width' : 'Final height'} 
        is out of bounds. ${currentZoomLevel < 1 ? 'The zoom level is less than 1.' : ''}
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
  }, [])

  useEffect(() => {
    if (!UICanvas.current) return

    const canvas = UICanvas.current

    canvas.addEventListener('wheel', onWheelChange)

    canvas.addEventListener('touchstart', onTouchStart)
    canvas.addEventListener('touchmove', onTouchChange)

    return () => {
      canvas.removeEventListener('wheel', onWheelChange)

      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchChange)
    }
  }, [UICanvas, onWheelChange, onTouchStart, onTouchChange])

  useEffect(() => {
    if (!UICanvasContext2D.current || !UICanvasImageData) return

    const { width: UICanvasWidth, height: UICanvasHeight, data } = UICanvasImageData

    if (currentToolSelected === 'Crop') {
      const imageBytes = getModifiedImageBytes({
        imageBytes: new Uint8Array(data.buffer),
        imgWidth: UICanvasWidth
      }, rowOfPixels => rowOfPixels.map(
        pixel => pixel.map((c, i) => i === 3 ? c : c / 2)
      ))

      const imageData = UICanvasContext2D.current.createImageData(UICanvasWidth, UICanvasHeight)

      imageData.data.set(imageBytes)
      UICanvasContext2D.current.putImageData(imageData, 0, 0)

      return
    }

    const { scaledImageData } = getScaledImageData(UICanvasImageData, zoom.level)

    const restOfProps = getRestOfPropsOnClippedImageData({
      zoom,
      prevZoom: prevZoom.current,
      prevFromCorner: prevFromCorner.current,
      UICanvasWidth,
      UICanvasHeight
    })

    prevZoom.current = zoom

    const { sx, sy } = restOfProps.requirements.fromCorner
    prevFromCorner.current = { sx, sy }

    const clippedImageData = getClippedImageData({
      imageDataToCut: scaledImageData,
      ...restOfProps
    })

    UICanvasContext2D.current.putImageData(clippedImageData, 0, 0)
  }, [zoom, UICanvasImageData, UICanvasContext2D, getRestOfPropsOnClippedImageData, currentToolSelected])

  return { zoom, zoomIn, zoomOut, restoreZoom }
}
