import './OverlayCanvas.css'

import { useLayoutEffect, useRef } from 'react'
import { useGrid, type Corner } from '../../hooks/OverlayCanvas/useGrid.ts'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'

import { CheckIcon } from '../../common/components/Icons.tsx'

const corners: Corner[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 }
]

export function OverlayCanvas () {
  const {
    crop,
    isAllowedToDoCrop,
    gridCanvasImageData,
    gridSizeAndOffset,
    allowGridToMove,
    disableGridToMove,
    handleOnGridMove,
    allowGridResizing,
    disableGridResizing,
    handleOnGridResizing
  } = useGrid()

  const { UICanvasImageData } = useUICanvas()

  const overlayCanvas = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    if (!gridCanvasImageData || !overlayCanvas.current) return

    const { width, height } = gridCanvasImageData

    overlayCanvas.current.width = width
    overlayCanvas.current.height = height

    const ctx = overlayCanvas.current.getContext('2d')!
    ctx.putImageData(gridCanvasImageData, 0, 0)
  }, [gridCanvasImageData])

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
        <canvas
          ref={overlayCanvas}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </section>
      {
        isAllowedToDoCrop && (
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
