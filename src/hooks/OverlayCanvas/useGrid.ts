import { type EventListener } from '../../types/types.ts'
import { type AspectRatio } from '../../components/Tools/Crop/Crop.tsx'

import { EVENTS } from '../../consts.ts'
import { IS_DEVELOPMENT } from '../../config.ts'

import { useCallback, useEffect, useRef, useState, TouchEvent, MouseEvent } from 'react'
import { usePosition } from '../../common/hooks/usePosition.ts'
import { useControls } from '../ControlPanel/useControls.ts'
import { useUICanvas } from '../Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../Canvas/useOffscreenCanvas.ts'

import { getClippedImageData } from '../../methods/getClippedImageData.ts'
import { ImageError } from '../../error-handling/ImageError.ts'

const initialGridSizeAndOffset = {
  width: { sx: 0, dw: 0 },
  height: { sy: 0, dh: 0 }
}

type PointerEvent = MouseEvent | TouchEvent

function isTouchEvent (e: PointerEvent): e is TouchEvent {
  return e.type === 'touchmove'
}

export type Corner = { x: 0 | 1, y: 0 | 1 }

interface HandleOnGridResizingProps {
  e: PointerEvent;
  corner: Corner
}

export function useGrid () {
  const [gridSizeAndOffset, setGridSizeAndOffset] = useState(initialGridSizeAndOffset)

  const [isAllowedToDoCrop, setIsAllowedToDoCrop] = useState(false)
  const [isTheGridAllowedToMove, setIsTheGridAllowedToMove] = useState(false)
  const [isChangingTheGridSizeAllowed, setIsChangingTheGridSizeAllowed] = useState(false)

  const { getPointerPositionOnUICanvas, getTouchesPositionOnUICanvas } = usePosition()

  const { cropCanvas } = useControls()

  const { UICanvasImageData } = useUICanvas()
  const { offscreenCanvasImageData } = useOffscreenCanvas()

  const [gridCanvasImageData, setGridCanvasImageData] = useState(UICanvasImageData)
  const latestUICanvasImageData = useRef(UICanvasImageData)

  const prevGridSizeAndOffset = useRef(initialGridSizeAndOffset)

  const prevPointerPositionOnMoving = useRef({ x: 0, y: 0 })
  const prevPointerPositionOnResizing = useRef({ x: 0, y: 0 })

  // grid move

  const allowGridToMove = useCallback((e: PointerEvent) => {
    const pointerPosition = isTouchEvent(e)
      ? getTouchesPositionOnUICanvas(e, 1)?.[0]
      : getPointerPositionOnUICanvas(e)

    if (!pointerPosition) return

    prevPointerPositionOnMoving.current = pointerPosition

    setIsTheGridAllowedToMove(true)
  }, [getPointerPositionOnUICanvas, getTouchesPositionOnUICanvas])

  const disableGridToMove = useCallback(() => {
    setIsTheGridAllowedToMove(false)
  }, [])

  const handleOnGridMove = useCallback((e: PointerEvent) => {
    if (!isTheGridAllowedToMove || !UICanvasImageData || e.target !== e.currentTarget) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData

    const pointerPosition = isTouchEvent(e)
      ? getTouchesPositionOnUICanvas(e, 1)?.[0]
      : getPointerPositionOnUICanvas(e)

    if (!pointerPosition) return

    const { x: currentPositionX, y: currentPositionY } = pointerPosition

    const { x: prevPositionX, y: prevPositionY } = prevPointerPositionOnMoving.current
    prevPointerPositionOnMoving.current = pointerPosition

    const displacementInX = currentPositionX - prevPositionX
    const displacementInY = currentPositionY - prevPositionY

    if (displacementInX === 0 && displacementInY === 0) return

    const updatedGridSizeAndOffset = { ...gridSizeAndOffset }

    if (displacementInX !== 0) {
      const { sx: prevSX, dw: prevDW } = gridSizeAndOffset.width

      const newSX = prevSX + displacementInX

      updatedGridSizeAndOffset.width.sx = newSX < 0
        ? 0
        : newSX + prevDW > UICanvasWidth
          ? prevSX
          : newSX
    }

    if (displacementInY !== 0) {
      const { sy: prevSY, dh: prevDH } = gridSizeAndOffset.height

      const newSY = prevSY + displacementInY

      updatedGridSizeAndOffset.height.sy = newSY < 0
        ? 0
        : newSY + prevDH > UICanvasHeight
          ? prevSY
          : newSY
    }

    setGridSizeAndOffset(updatedGridSizeAndOffset)
  }, [isTheGridAllowedToMove, UICanvasImageData, getPointerPositionOnUICanvas, getTouchesPositionOnUICanvas, gridSizeAndOffset])

  // grid resizing

  const allowGridResizing = useCallback((e: PointerEvent) => {
    const pointerPosition = isTouchEvent(e)
      ? getTouchesPositionOnUICanvas(e, 1)?.[0]
      : getPointerPositionOnUICanvas(e)

    if (!pointerPosition) return

    prevPointerPositionOnResizing.current = pointerPosition

    setIsChangingTheGridSizeAllowed(true)
  }, [getPointerPositionOnUICanvas, getTouchesPositionOnUICanvas])

  const disableGridResizing = useCallback(() => {
    setIsChangingTheGridSizeAllowed(false)
  }, [])

  const handleOnGridResizing = useCallback(({ e, corner }: HandleOnGridResizingProps) => {
    if (!isChangingTheGridSizeAllowed || !UICanvasImageData || !offscreenCanvasImageData) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData
    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvasImageData

    if (offscreenCanvasWidth <= 16 || offscreenCanvasHeight <= 16) return

    const pointerPosition = isTouchEvent(e)
      ? getTouchesPositionOnUICanvas(e, 1)?.[0]
      : getPointerPositionOnUICanvas(e)

    if (!pointerPosition) return

    const { x: currentPositionX, y: currentPositionY } = pointerPosition

    const { x: prevPositionX, y: prevPositionY } = prevPointerPositionOnResizing.current
    prevPointerPositionOnResizing.current = pointerPosition

    const displacementInX = currentPositionX - prevPositionX
    const displacementInY = currentPositionY - prevPositionY

    if (displacementInX === 0 && displacementInY === 0) return

    const updatedGridSizeAndOffset = { ...gridSizeAndOffset }

    const { sx: prevSX, dw: prevDW } = gridSizeAndOffset.width
    const { sy: prevSY, dh: prevDH } = gridSizeAndOffset.height

    if (displacementInX !== 0) {
      const isWorkingCornerOnLeft = corner.x === 0

      if (isWorkingCornerOnLeft) {
        updatedGridSizeAndOffset.width.sx = currentPositionX
        updatedGridSizeAndOffset.width.dw += prevSX - currentPositionX
      } else {
        const newDW = prevDW + displacementInX

        updatedGridSizeAndOffset.width.dw = newDW + prevSX > UICanvasWidth
          ? prevDW
          : newDW
      }
    }

    if (displacementInY !== 0) {
      const isWorkingCornerOnTop = corner.y === 0

      if (isWorkingCornerOnTop) {
        const newDH = prevDH + prevSY - currentPositionY

        if (newDH <= UICanvasHeight) {
          updatedGridSizeAndOffset.height.sy = currentPositionY
          updatedGridSizeAndOffset.height.dh = newDH
        }
      } else {
        const newDH = prevDH + displacementInY
        updatedGridSizeAndOffset.height.dh = newDH + prevSY > UICanvasHeight ? prevDH : newDH
      }
    }

    const gridWidthLimit = UICanvasWidth / 5
    const gridHeightLimit = UICanvasHeight / 5

    if (updatedGridSizeAndOffset.width.dw < gridWidthLimit) {
      updatedGridSizeAndOffset.width = {
        dw: gridWidthLimit,
        sx: prevSX
      }
    }

    if (updatedGridSizeAndOffset.height.dh < gridHeightLimit) {
      updatedGridSizeAndOffset.height = {
        dh: gridHeightLimit,
        sy: prevSY
      }
    }

    const { sx: updatedSX, dw: updatedDW } = updatedGridSizeAndOffset.width
    const { sy: updatedSY, dh: updatedDH } = updatedGridSizeAndOffset.height

    if (updatedSX + updatedDW > UICanvasWidth || updatedSY + updatedDH > UICanvasHeight) return

    setGridSizeAndOffset(updatedGridSizeAndOffset)

    setIsAllowedToDoCrop(true)
  }, [isChangingTheGridSizeAllowed, UICanvasImageData, offscreenCanvasImageData, getPointerPositionOnUICanvas, getTouchesPositionOnUICanvas, gridSizeAndOffset])

  // crop

  const crop = useCallback(() => {
    if (!UICanvasImageData) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData

    const { sx, dw } = gridSizeAndOffset.width
    const { sy, dh } = gridSizeAndOffset.height

    if (!(sx !== 0 || dw !== UICanvasWidth || sy !== 0 || dh !== UICanvasHeight)) return

    cropCanvas({
      proportionOfSX: sx / UICanvasWidth,
      proportionOfSY: sy / UICanvasHeight,
      proportionOfWidth: dw / UICanvasWidth,
      proportionOfHeight: dh / UICanvasHeight
    })

    setIsAllowedToDoCrop(false)
  }, [UICanvasImageData, cropCanvas, gridSizeAndOffset])

  // ---

  const onAspectRatioChange = useCallback((e: CustomEvent<AspectRatio>) => {
    if (!UICanvasImageData || !offscreenCanvasImageData) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData
    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvasImageData

    if (offscreenCanvasWidth <= 16 || offscreenCanvasHeight <= 16) return

    const { aspectRatio } = e.detail

    if (aspectRatio === 'original') {
      setGridSizeAndOffset({
        width: { sx: 0, dw: UICanvasWidth },
        height: { sy: 0, dh: UICanvasHeight }
      })

      return
    }

    setIsAllowedToDoCrop(true)

    if (UICanvasWidth / UICanvasHeight > aspectRatio) {
      const newWidth = UICanvasHeight * aspectRatio
      const newSX = (UICanvasWidth - newWidth) / 2

      setGridSizeAndOffset({
        width: { sx: newSX, dw: newWidth },
        height: { sy: 0, dh: UICanvasHeight }
      })

      return
    }

    const newHeight = UICanvasWidth / aspectRatio
    const newSY = (UICanvasHeight - newHeight) / 2

    setGridSizeAndOffset({
      width: { sx: 0, dw: UICanvasWidth },
      height: { sy: newSY, dh: newHeight }
    })
  }, [UICanvasImageData, offscreenCanvasImageData])

  useEffect(() => {
    window.addEventListener(EVENTS.ASPECT_RATIO, onAspectRatioChange as EventListener)
    window.addEventListener(EVENTS.TOGGLE_TOOL, crop)

    return () => {
      window.removeEventListener(EVENTS.ASPECT_RATIO, onAspectRatioChange as EventListener)
      window.removeEventListener(EVENTS.TOGGLE_TOOL, crop)
    }
  }, [onAspectRatioChange, crop])

  // reset gridSizeAndOffset

  useEffect(() => {
    if (!UICanvasImageData) return

    latestUICanvasImageData.current = UICanvasImageData

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData

    setGridSizeAndOffset({
      width: { sx: 0, dw: UICanvasWidth },
      height: { sy: 0, dh: UICanvasHeight }
    })

    setIsAllowedToDoCrop(false)
  }, [UICanvasImageData])

  // re-draw overlayCanvas

  useEffect(() => {
    if (!latestUICanvasImageData.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = latestUICanvasImageData.current

    const { sx, dw } = gridSizeAndOffset.width
    const { sy, dh } = gridSizeAndOffset.height

    if (dw === 0 || dh === 0) return

    const isAnyMeasurementOfGridInvalid = [sx, sy, dw, dh].some(p => p < 0)

    const isGridWidthOutOfBounds = sx + dw > UICanvasWidth
    const isGridHeightOutOfBounds = sy + dh > UICanvasHeight

    if (isAnyMeasurementOfGridInvalid || isGridWidthOutOfBounds || isGridHeightOutOfBounds) {
      setGridSizeAndOffset(prevGridSizeAndOffset.current)

      if (IS_DEVELOPMENT) {
        console.log({ isAnyMeasurementOfGridInvalid, isGridWidthOutOfBounds, isGridHeightOutOfBounds })
      }

      console.error(new ImageError('Grid is out of bounds.'))

      return
    }

    prevGridSizeAndOffset.current = gridSizeAndOffset

    if (sx === 0 && sy === 0 && dw === UICanvasWidth && dh === UICanvasHeight) {
      setIsAllowedToDoCrop(false)
    }

    const clippedImageData = getClippedImageData({
      imageDataToCut: latestUICanvasImageData.current,
      requirements: {
        finalWidth: dw,
        finalHeight: dh,
        fromCorner: {
          sx,
          sy
        }
      }
    })

    setGridCanvasImageData(clippedImageData)
  }, [gridSizeAndOffset])

  return {
    isAllowedToDoCrop,
    gridCanvasImageData,
    gridSizeAndOffset,
    allowGridToMove,
    disableGridToMove,
    handleOnGridMove,
    allowGridResizing,
    disableGridResizing,
    handleOnGridResizing,
    crop
  }
}
