import './OverlayCanvas.css'

import { type AVAILABLE_TOOLS } from '../Tools/tools.tsx'

import { useGrid, type Corner } from '../../hooks/OverlayCanvas/useGrid.ts'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'

import { CheckIcon } from '../../common/components/Icons.tsx'

interface OverlayCanvasProps {
  currentToolSelected: AVAILABLE_TOOLS
}

const corners: Corner[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 }
]

export function OverlayCanvas ({ currentToolSelected }: OverlayCanvasProps) {
  const {
    crop,
    isAllowedToDoCrop,
    overlayCanvas,
    gridSizeAndOffset,
    allowGridToMove,
    disableGridToMove,
    handleOnGridMove,
    allowGridResizing,
    disableGridResizing,
    handleOnGridResizing
  } = useGrid({ currentToolSelected })

  const { UICanvasImageData } = useUICanvas()

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
