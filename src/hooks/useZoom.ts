import { ZOOM_LIMITS } from '../consts.ts'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUICanvas } from './useUICanvas.ts'

import { dispatchWarning } from '../methods/dispatchWarning.ts'
import { getScalingImageBytes } from '../methods/getScalingImageBytes.ts'
import { getClippedImageBytes } from '../methods/getClippedImageBytes.ts'
import { getRestOfPropsOnClippedImageBytes } from '../helpers/clippedImageBytesProps.ts'

type PointerPosition = { x: number; y: number } | 'center'

export interface Zoom {
  level: number;
  pointerPosition: PointerPosition
}

interface ChangeZoom {
  pointerPosition: PointerPosition;
  n?: number
}

const changeZoomDefaultProps: ChangeZoom = { pointerPosition: 'center', n: 0.2 }

export function useZoom () {
  const [zoom, setZoom] = useState<Zoom>({
    level: 1,
    pointerPosition: 'center'
  })

  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasImageBytes
  } = useUICanvas()

  const prevZoom = useRef(zoom)

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

    // to do: improve user experience when zooming in and out with mouse on PC
    // the enlarged image jumps when zooming to another position

    const { deltaY, clientX, clientY } = e
    const { left, top } = UICanvas.current.getBoundingClientRect()

    const x = clientX - left
    const y = clientY - top

    const pointerPosition = { x, y }

    const n = deltaY * 0.0008

    if (deltaY < 0) {
      zoomIn({ pointerPosition, n: -n })
      return
    }

    zoomOut({ pointerPosition, n })
  }, [zoomIn, zoomOut, UICanvas])

  useEffect(() => {
    if (!UICanvas.current) return

    const canvas = UICanvas.current

    // to do: add zoom by tapping on mobile-like electronic devices

    canvas.addEventListener('wheel', onWheelChange)

    return () => {
      canvas.removeEventListener('wheel', onWheelChange)
    }
  }, [UICanvas, onWheelChange])

  useEffect(() => {
    if (!getScalingImageBytes ||
      !UICanvas.current ||
      !UICanvasContext2D.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    const {
      scalingImageBytes
    } = getScalingImageBytes({
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
      UICanvasWidth,
      UICanvasHeight
    })

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
