import './OverlayCanvas.css'

import { MouseEvent, TouchEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'
import { useControls } from '../../hooks/ControlPanel/useControls.ts'

import { getClippedImageBytes } from '../../methods/getClippedImageBytes.ts'
import { doUintsMatch } from '../../common/helpers/doUintsMatch.ts'

import { ImageError } from '../../error-handling/ImageError.ts'

import { CheckIcon } from '../../common/components/Icons.tsx'

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

export function OverlayCanvas () {
  const [gridSizeAndOffset, setGridSizeAndOffset] = useState({
    width: { sx: 0, dw: 0 },
    height: { sy: 0, dh: 0 }
  })

  const [isTheGridAllowedToMove, setIsTheGridAllowedToMove] = useState(false)
  const [isChangingTheGridSizeAllowed, setIsChangingTheGridSizeAllowed] = useState(false)

  const { cropCanvas } = useControls()

  const { UICanvas, UICanvasImageBytes } = useUICanvas()
  const { offscreenCanvas } = useOffscreenCanvas()

  const overlayCanvas = useRef<HTMLCanvasElement>(null)

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
    if (!isTheGridAllowedToMove || !UICanvas.current || e.target !== e.currentTarget) return

    const pointerPosition = getPointerPositionOnCanvas(e)

    if (pointerPosition === null) return

    const { x: currentPositionX, y: currentPositionY } = pointerPosition

    const { x: prevPositionX, y: prevPositionY } = prevPointerPositionOnMoving.current
    prevPointerPositionOnMoving.current = pointerPosition

    const displacementInX = currentPositionX - prevPositionX
    const displacementInY = currentPositionY - prevPositionY

    if (displacementInX === 0 && displacementInY === 0) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

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
  }, [isTheGridAllowedToMove, UICanvas, getPointerPositionOnCanvas, gridSizeAndOffset])

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
    if (!isChangingTheGridSizeAllowed ||
      !UICanvas.current ||
      !offscreenCanvas.current) return

    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvas.current

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

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

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

    const { dw: updatedDW } = updatedGridSizeAndOffset.width
    const { dh: updatedDH } = updatedGridSizeAndOffset.height

    const gridWidthLimit = UICanvasWidth / 5
    const gridHeightLimit = UICanvasHeight / 5

    if (updatedDW < gridWidthLimit) {
      updatedGridSizeAndOffset.width = {
        dw: gridWidthLimit,
        sx: prevSX
      }
    }

    if (updatedDH < gridHeightLimit) {
      updatedGridSizeAndOffset.height = {
        dh: gridHeightLimit,
        sy: prevSY
      }
    }

    setGridSizeAndOffset(updatedGridSizeAndOffset)
  }, [isChangingTheGridSizeAllowed, UICanvas, offscreenCanvas, getPointerPositionOnCanvas, gridSizeAndOffset])

  const crop = useCallback(() => {
    if (!UICanvas.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current
    const { sx, dw } = gridSizeAndOffset.width
    const { sy, dh } = gridSizeAndOffset.height

    cropCanvas({
      proportionOfSX: sx / UICanvasWidth,
      proportionOfSY: sy / UICanvasHeight,
      proportionOfWidth: dw / UICanvasWidth,
      proportionOfHeight: dh / UICanvasHeight
    })
  }, [UICanvas, cropCanvas, gridSizeAndOffset])

  useEffect(() => {
    if (UICanvasImageBytes.byteLength === 0 ||
      !UICanvas.current) return

    setGridSizeAndOffset({
      width: { sx: 0, dw: UICanvas.current.width },
      height: { sy: 0, dh: UICanvas.current.height }
    })
  }, [UICanvas, UICanvasImageBytes])

  useLayoutEffect(() => {
    if (UICanvasImageBytes.byteLength === 0 ||
      !UICanvas.current ||
      !overlayCanvas.current) return

    if (!doUintsMatch(UICanvasImageBytes, prevUICanvasImageBytes.current)) {
      prevUICanvasImageBytes.current = UICanvasImageBytes
      return
    }

    prevUICanvasImageBytes.current = UICanvasImageBytes

    const { sx, dw } = gridSizeAndOffset.width
    const { sy, dh } = gridSizeAndOffset.height

    if (dw === 0 || dh === 0) return

    const isAnyMeasurementOfGridInvalid = [sx, sy, dw, dh].some(p => p < 0)

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

    const isGridWidthOutOfBounds = sx + dw > UICanvasWidth
    const isGridHeightOutOfBounds = sy + dh > UICanvasHeight

    if (isAnyMeasurementOfGridInvalid || isGridWidthOutOfBounds || isGridHeightOutOfBounds) {
      console.log({ isAnyMeasurementOfGridInvalid, isGridWidthOutOfBounds, isGridHeightOutOfBounds })

      throw new ImageError('Grid is out of bounds.')
    }

    const clippedImageBytes = getClippedImageBytes({
      imageBytesToCut: UICanvasImageBytes,
      widthOfImgToCut: UICanvasWidth,
      heightOfImgToCut: UICanvasHeight,
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

    const imageData = overlayCtx.createImageData(dw, dh)
    imageData.data.set(clippedImageBytes)
    overlayCtx.putImageData(imageData, 0, 0)
  }, [gridSizeAndOffset, UICanvasImageBytes, UICanvas])

  return (
    <div
      className="overlay-canvas"
      style={{
        width: `${UICanvas.current?.width ?? 0}px`,
        height: `${UICanvas.current?.height ?? 0}px`
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
        <canvas
          ref={overlayCanvas}
        />
      </section>
      {
        (
          gridSizeAndOffset.width.sx !== 0 ||
          gridSizeAndOffset.width.dw !== UICanvas.current?.width ||
          gridSizeAndOffset.height.sy !== 0 ||
          gridSizeAndOffset.height.dh !== UICanvas.current.height
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
