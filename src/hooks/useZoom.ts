import { ZOOM_LIMITS } from '../consts.ts'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUICanvas } from './useUICanvas.ts'

import { dispatchWarning } from '../methods/dispatchWarning.ts'
import { getTouchesPosition } from '../methods/getTouchesPosition.ts'
import { getScalingImageBytes } from '../methods/getScaledImage.ts'
import { getClippedImageBytes } from '../methods/getClippedImageBytes.ts'
import { getRestOfPropsOnClippedImageBytes } from '../helpers/clippedImageBytesProps.ts'

export type Position = { x: number; y: number }

type PointerPosition = Position | 'center'

export interface Zoom {
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

const changeZoomDefaultProps: ChangeZoom = { pointerPosition: 'center', n: 0.2 }

export function useZoom () {
  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasImageBytes
  } = useUICanvas()

  const [zoom, setZoom] = useState<Zoom>({ level: 1, pointerPosition: 'center' })

  const prevZoom = useRef(zoom)
  const prevFromCorner = useRef({ sx: 0, sy: 0 })
  const prevTouchesPosition = useRef<PrevTouchesPosition>(['center', 'center'])

  const zoomIn = useCallback(({ pointerPosition = 'center', n = 0.2 }: ChangeZoom = changeZoomDefaultProps) => {
    if (zoom.level === ZOOM_LIMITS.MAX) return

    setZoom(prevZoom => {
      const { level } = prevZoom

      const desiredZoom = Number((level + n).toFixed(2))

      const newZoomLevel = desiredZoom > ZOOM_LIMITS.MAX
        ? ZOOM_LIMITS.MAX
        : desiredZoom

      return { level: newZoomLevel, pointerPosition }
    })
  }, [zoom])

  const zoomOut = useCallback(({ pointerPosition = 'center', n = 0.2 }: ChangeZoom = changeZoomDefaultProps) => {
    if (zoom.level === ZOOM_LIMITS.MIN) return

    setZoom(prevZoom => {
      const { level } = prevZoom

      const desiredZoom = Number((level - n).toFixed(2))

      const newZoomLevel = desiredZoom < ZOOM_LIMITS.MIN
        ? ZOOM_LIMITS.MIN
        : desiredZoom

      return { level: newZoomLevel, pointerPosition }
    })
  }, [zoom])

  const restoreZoom = useCallback(() => {
    setZoom({
      level: 1,
      pointerPosition: 'center'
    })
  }, [])

  const onWheelChange = useCallback((e: WheelEvent) => {
    if (!UICanvas.current) return

    const { deltaY, clientX, clientY } = e
    const { left, top } = UICanvas.current.getBoundingClientRect()

    const x = clientX - left
    const y = clientY - top

    const pointerPosition = { x, y }

    const n = deltaY * 0.0008

    if (deltaY < 0) return zoomIn({ pointerPosition, n: -n })

    zoomOut({ pointerPosition, n })
  }, [zoomIn, zoomOut, UICanvas])

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
  }, [UICanvas, zoomIn, zoomOut])

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (!UICanvas.current || e.touches.length !== 2) return

    const { left, top } = UICanvas.current.getBoundingClientRect()
    const [touch1, touch2] = getTouchesPosition({ e, left, top })
    prevTouchesPosition.current = [touch1, touch2]
  }, [UICanvas])

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
    if (!getScalingImageBytes ||
      !UICanvas.current ||
      !UICanvasContext2D.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    const { scalingImageBytes } = getScalingImageBytes({
      imageBytes: UICanvasImageBytes,
      canvasWidth: UICanvasWidth,
      canvasHeight: UICanvasHeight,
      scaling: zoom.level
    })

    if (!(scalingImageBytes instanceof Uint8Array)) {
      setZoom(prevZoom.current)

      if (scalingImageBytes === undefined) {
        dispatchWarning('Unexpected error when zoom in on the image.')
        return
      }

      dispatchWarning('The image is too large to zoom in further.')
      return
    }

    const restOfProps = getRestOfPropsOnClippedImageBytes({
      zoom,
      prevZoom: prevZoom.current,
      prevFromCorner: prevFromCorner.current,
      UICanvasWidth,
      UICanvasHeight
    })

    const { sx, sy } = restOfProps.requirements.fromCorner
    prevFromCorner.current = { sx, sy }

    const clippedImageBytes = getClippedImageBytes({
      imageBytesToCut: scalingImageBytes,
      ...restOfProps
    })

    const imageData = UICanvasContext2D.current.createImageData(UICanvasWidth, UICanvasHeight)
    imageData.data.set(clippedImageBytes)
    UICanvasContext2D.current.putImageData(imageData, 0, 0)

    prevZoom.current = zoom
  }, [zoom, UICanvasImageBytes, UICanvas, UICanvasContext2D])

  return { zoom, zoomIn, zoomOut, restoreZoom }
}
