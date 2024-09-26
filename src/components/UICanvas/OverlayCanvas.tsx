import './OverlayCanvas.css'

import { type AvailableToolsNames } from '../Tools/tools.tsx'
import { type EventListener } from '../../types/types.ts'
import { type AspectRatio } from '../Tools/Crop/Crop.tsx'

import { IS_DEVELOPMENT } from '../../config.ts'
import { EVENTS } from '../../consts.ts'

import { MouseEvent, TouchEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'
import { useControls } from '../../hooks/ControlPanel/useControls.ts'

import { getClippedImageData } from '../../methods/getClippedImageData.ts'
import { doUintsMatch } from '../../common/helpers/doUintsMatch.ts'

import { ImageError } from '../../error-handling/ImageError.ts'

import { CheckIcon } from '../../common/components/Icons.tsx'

interface OverlayCanvasProps {
  currentToolSelected: AvailableToolsNames
}

const initialGridSizeAndOffset = {
  width: { sx: 0, dw: 0 },
  height: { sy: 0, dh: 0 }
}

type PointerEvent = MouseEvent | TouchEvent

function isTouchEvent (e: PointerEvent): e is TouchEvent {
  return e.type === 'touchmove'
}

type Corner = { x: 0 | 1, y: 0 | 1 }

const corners: Corner[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 }
]

interface HandleOnGridResizingProps {
  e: PointerEvent;
  corner: Corner
}

export function OverlayCanvas ({ currentToolSelected }: OverlayCanvasProps) {
  const [gridSizeAndOffset, setGridSizeAndOffset] = useState(initialGridSizeAndOffset)

  const [isTheGridAllowedToMove, setIsTheGridAllowedToMove] = useState(false)
  const [isChangingTheGridSizeAllowed, setIsChangingTheGridSizeAllowed] = useState(false)

  const { cropCanvas } = useControls()

  const { UICanvas, UICanvasImageData } = useUICanvas()
  const { offscreenCanvasImageData } = useOffscreenCanvas()

  const overlayCanvas = useRef<HTMLCanvasElement>(null)

  const prevGridSizeAndOffset = useRef(initialGridSizeAndOffset)

  const prevPointerPositionOnMoving = useRef({ x: 0, y: 0 })
  const prevPointerPositionOnResizing = useRef({ x: 0, y: 0 })

  const prevUICanvasImageBytes = useRef(new Uint8Array())

  const getPointerPositionOnCanvas = useCallback((e: PointerEvent) => {
    if (!UICanvas.current) return null

    const { left, top } = UICanvas.current.getBoundingClientRect()

    let positionX, positionY

    if (isTouchEvent(e)) {
      const { clientX, clientY } = e.touches[0]

      positionX = clientX - left
      positionY = clientY - top
    } else {
      const { clientX, clientY } = e

      positionX = clientX - left
      positionY = clientY - top
    }

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    positionX = positionX > 0 ? Math.min(positionX, UICanvasWidth) : 0
    positionY = positionY > 0 ? Math.min(positionY, UICanvasHeight) : 0

    return { x: positionX, y: positionY }
  }, [UICanvas])

  // grid move

  const allowGridToMove = useCallback((e: PointerEvent) => {
    const pointerPosition = getPointerPositionOnCanvas(e)

    if (pointerPosition === null) return

    prevPointerPositionOnMoving.current = pointerPosition

    setIsTheGridAllowedToMove(true)
  }, [getPointerPositionOnCanvas])

  const disableGridToMove = useCallback(() => {
    setIsTheGridAllowedToMove(false)
  }, [])

  const handleOnGridMove = useCallback((e: PointerEvent) => {
    if (!isTheGridAllowedToMove || !UICanvasImageData || e.target !== e.currentTarget) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData

    const pointerPosition = getPointerPositionOnCanvas(e)

    if (pointerPosition === null) return

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
  }, [isTheGridAllowedToMove, UICanvasImageData, getPointerPositionOnCanvas, gridSizeAndOffset])

  // grid resizing

  const allowGridResizing = useCallback((e: PointerEvent) => {
    const pointerPosition = getPointerPositionOnCanvas(e)

    if (pointerPosition === null) return

    prevPointerPositionOnResizing.current = pointerPosition

    setIsChangingTheGridSizeAllowed(true)
  }, [getPointerPositionOnCanvas])

  const disableGridResizing = useCallback(() => {
    setIsChangingTheGridSizeAllowed(false)
  }, [])

  const handleOnGridResizing = useCallback(({ e, corner }: HandleOnGridResizingProps) => {
    if (!isChangingTheGridSizeAllowed || !UICanvasImageData || !offscreenCanvasImageData) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData
    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvasImageData

    if (offscreenCanvasWidth <= 16 || offscreenCanvasHeight <= 16) return

    const pointerPosition = getPointerPositionOnCanvas(e)

    if (pointerPosition === null) return

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
  }, [isChangingTheGridSizeAllowed, UICanvasImageData, offscreenCanvasImageData, getPointerPositionOnCanvas, gridSizeAndOffset])

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
  }, [UICanvasImageData, cropCanvas, gridSizeAndOffset])

  const onToggleTool = useCallback((e: CustomEvent<AvailableToolsNames>) => {
    if (currentToolSelected === 'Crop' && e.detail !== 'Crop') crop()
  }, [currentToolSelected, crop])

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
    window.addEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)

    return () => {
      window.removeEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)
    }
  }, [onToggleTool])

  useEffect(() => {
    window.addEventListener(EVENTS.ASPECT_RATIO, onAspectRatioChange as EventListener)

    return () => {
      window.removeEventListener(EVENTS.ASPECT_RATIO, onAspectRatioChange as EventListener)
    }
  }, [onAspectRatioChange])

  useEffect(() => {
    if (!UICanvasImageData) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData

    setGridSizeAndOffset({
      width: { sx: 0, dw: UICanvasWidth },
      height: { sy: 0, dh: UICanvasHeight }
    })
  }, [UICanvasImageData])

  useLayoutEffect(() => {
    if (!UICanvasImageData || !overlayCanvas.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvasImageData

    const UICanvasImageBytes = new Uint8Array(UICanvasImageData.data.buffer)

    if (!doUintsMatch(UICanvasImageBytes, prevUICanvasImageBytes.current)) {
      prevUICanvasImageBytes.current = UICanvasImageBytes
      return
    }

    prevUICanvasImageBytes.current = UICanvasImageBytes

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

    const clippedImageData = getClippedImageData({
      imageDataToCut: UICanvasImageData,
      requirements: {
        finalWidth: dw,
        finalHeight: dh,
        fromCorner: {
          sx,
          sy
        }
      }
    })

    overlayCanvas.current.width = dw
    overlayCanvas.current.height = dh

    const overlayCtx = overlayCanvas.current.getContext('2d')!

    overlayCtx.putImageData(clippedImageData, 0, 0)
  }, [gridSizeAndOffset, UICanvasImageData])

  return (
    <div
      className="overlay-canvas"
      style={{
        width: `${UICanvasImageData ? UICanvasImageData.width : 0}px`,
        height: `${UICanvasImageData ? UICanvasImageData.height : 0}px`
      }}
    >
      <section
        className="overlay-canvas__grid"
        style={{
          width: `${gridSizeAndOffset.width.dw}px`,
          height: `${gridSizeAndOffset.height.dh}px`,
          left: `${gridSizeAndOffset.width.sx}px`,
          top: `${gridSizeAndOffset.height.sy}px`
        }}
      >
        <div
          className='grid'

          onMouseDown={allowGridToMove}
          onMouseUp={disableGridToMove}
          onMouseLeave={disableGridToMove}
          onMouseMove={handleOnGridMove}

          onTouchStart={allowGridToMove}
          onTouchEnd={disableGridToMove}
          onTouchMove={handleOnGridMove}
        >
          {
            corners.map(({ x, y }, i) => (
              <div
                key={i}
                className='overlay-canvas__grid--corner'
                style={{
                  left: x === 0 ? '-5px' : 'calc(100% - 9px)',
                  top: y === 0 ? '-5px' : 'calc(100% - 9px)'
                }}

                onMouseDown={allowGridResizing}
                onMouseUp={disableGridResizing}
                onMouseLeave={disableGridResizing}
                onMouseMove={(e) => handleOnGridResizing({ e, corner: { x, y } })}

                onTouchStart={allowGridResizing}
                onTouchEnd={disableGridResizing}
                onTouchMove={(e) => handleOnGridResizing({ e, corner: { x, y } })}
              />
            ))
          }
        </div>
        <canvas ref={overlayCanvas} />
      </section>
      {
        (
          UICanvasImageData
            ? gridSizeAndOffset.width.sx !== 0 ||
              (gridSizeAndOffset.width.dw !== UICanvasImageData.width && gridSizeAndOffset.width.dw !== 0) ||
              gridSizeAndOffset.height.sy !== 0 ||
              (gridSizeAndOffset.height.dh !== UICanvasImageData.height && gridSizeAndOffset.width.dw !== 0)
            : false
        ) && (
          <button
            className='overlay-canvas__btn--crop'
            onClick={crop}
          >
            <CheckIcon />
          </button>
        )
      }
    </div>
  )
}
