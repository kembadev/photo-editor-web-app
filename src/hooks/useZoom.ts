import { type ImageScalerResponsePayload, getImageScaler } from '../methods/getImageScaler.ts'

import { ZOOM_LIMITS } from '../consts.ts'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useUICanvas } from './useUICanvas.ts'
import { dispatchWarning } from '../methods/dispatchWarning.ts'
import { getClippedImageBytes } from '../methods/getClippedImageBytes.ts'

export function useZoom () {
  const [zoom, setZoom] = useState(1)

  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageBytes
  } = useUICanvas()

  const cacheCleaner = useRef<{ clearCache:() => void } | null>(null)

  const zoomIn = useCallback((n = 0.2) => {
    setZoom(prevZoom => {
      const desiredZoom = Number((prevZoom + n).toFixed(2))

      const newZoom = desiredZoom > ZOOM_LIMITS.MAX
        ? ZOOM_LIMITS.MAX
        : desiredZoom

      return newZoom
    })
  }, [])

  const zoomOut = useCallback((n = 0.2) => {
    setZoom(prevZoom => {
      const desiredZoom = Number((prevZoom - n).toFixed(2))

      const newZoom = desiredZoom < ZOOM_LIMITS.MIN
        ? ZOOM_LIMITS.MIN
        : desiredZoom

      return newZoom
    })
  }, [])

  const restoreZoom = useCallback(() => {
    setZoom(1)
  }, [])

  const onWheelChange = useCallback((e: WheelEvent) => {
    const { deltaY } = e

    const zoomLevel = 0.0008

    if (deltaY < 0) {
      zoomIn(deltaY * -zoomLevel)
    } else {
      zoomOut(deltaY * zoomLevel)
    }
  }, [zoomIn, zoomOut])

  const getScalingImageBytes: ((scaling: number) => Promise<ImageScalerResponsePayload>) | void = useMemo(() => {
    if (!UICanvas.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    if (cacheCleaner.current) cacheCleaner.current.clearCache()

    const { clearCache, scale } = getImageScaler({
      imageBytes: UICanvasImageBytes,
      imgWidth: UICanvasWidth,
      imgHeight: UICanvasHeight
    })

    cacheCleaner.current = { clearCache }

    return scale
  }, [UICanvasImageBytes, UICanvas])

  useEffect(() => {
    if (!UICanvas.current) return

    const canvas = UICanvas.current

    canvas.addEventListener('wheel', onWheelChange)

    return () => {
      canvas.removeEventListener('wheel', onWheelChange)
    }
  }, [UICanvas, onWheelChange])

  useEffect(() => {
    if (!getScalingImageBytes ||
      !UICanvas.current ||
      !UICanvasContainer.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    ;(async () => {
      const { scalingImageBytes: expandedImageBytes } = await getScalingImageBytes(zoom)

      if (expandedImageBytes === undefined) {
        dispatchWarning('Unexpected error when zooming the image.')
        return
      }

      if (expandedImageBytes === 'RangeError') {
        dispatchWarning('Image is too large to keep zooming it.')
        return
      }

      const expandedWidth = UICanvasWidth * zoom
      const expandedHeight = UICanvasHeight * zoom

      const clippedImageBytes = await getClippedImageBytes({
        imageBytes: expandedImageBytes,
        imgWidth: expandedWidth,
        imgHeight: expandedHeight,
        desiredDimensionsList: [
          {
            desiredWidth: UICanvasWidth,
            desiredHeight: UICanvasHeight
          }
        ]
      })
      const { imageBytes, dimensions } = clippedImageBytes[0]

      const imageData = UICanvasContext2D.current!.createImageData(dimensions.width, dimensions.height)
      imageData.data.set(imageBytes)
      UICanvasContext2D.current!.putImageData(imageData, 0, 0)
    })()
  }, [getScalingImageBytes, zoom, UICanvas, UICanvasContext2D, UICanvasContainer])

  return { zoom, zoomIn, zoomOut, restoreZoom }
}
