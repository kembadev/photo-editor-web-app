import { ZOOM_LIMITS } from '../consts.ts'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useUICanvas } from './useUICanvas.ts'

import { dispatchWarning } from '../methods/dispatchWarning.ts'
import { getImageScaler } from '../methods/getImageScaler.ts'
import { getClippedImageBytes } from '../methods/getClippedImageBytes.ts'
import { getRestOfPropsOnClippedImageBytes } from '../helpers/clippedImageBytesProps.ts'

export type PointerPosition = { x: number; y: number } | 'center'

interface Zoom {
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

  const prevZoom = useRef<Zoom>(zoom)
  const cacheCleaner = useRef<{ clearCache:() => void } | null>(null)

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
    const { deltaY } = e

    const n = deltaY * 0.0008

    const pointerPosition = 'center' // bad

    if (deltaY < 0) {
      zoomIn({ pointerPosition, n: -n })
      return
    }

    zoomOut({ pointerPosition, n })
  }, [zoomIn, zoomOut])

  const getScalingImageBytes = useMemo(() => {
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
      !UICanvas.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    ;(async () => {
      const { scalingImageBytes: expandedImageBytes } = await getScalingImageBytes(zoom.level)

      if (!(expandedImageBytes instanceof Uint8Array)) {
        setZoom(prevZoom.current)

        if (expandedImageBytes === undefined) {
          dispatchWarning('Unexpected error when zoom in on the image.')
          return
        }

        dispatchWarning('The image is too large to zoom in further.')
        return
      }

      prevZoom.current = zoom

      const { level, pointerPosition } = zoom

      const expandedWidth = UICanvasWidth * level
      const expandedHeight = UICanvasHeight * level

      const listOfRequirements = [
        getRestOfPropsOnClippedImageBytes({
          widthOfImgToCut: expandedWidth,
          heightOfImgToCut: expandedHeight,
          finalWidth: UICanvasWidth,
          finalHeight: UICanvasHeight,
          pointerPosition
        })
      ]

      const clippedImageBytes = await getClippedImageBytes({
        imageBytesToCut: expandedImageBytes,
        widthOfImgToCut: expandedWidth,
        heightOfImgToCut: expandedHeight,
        listOfRequirements
      })

      const { imageBytes, dimensions } = clippedImageBytes[0]

      const imageData = UICanvasContext2D.current!.createImageData(dimensions.width, dimensions.height)
      imageData.data.set(imageBytes)
      UICanvasContext2D.current!.putImageData(imageData, 0, 0)
    })()
  }, [getScalingImageBytes, zoom, UICanvas, UICanvasContext2D])

  return { zoom, zoomIn, zoomOut, restoreZoom }
}
