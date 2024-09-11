import './UICanvas.css'

import { type EventListener } from '../../types/types.ts'
import { type ClippedImageBytesResponse } from '../../methods/getClippedImageBytes.ts'
import { type AvailableToolsNames } from '../Tools/tools.tsx'

import { EVENTS, ZOOM_LIMITS } from '../../consts.ts'
import { IS_DEVELOPMENT } from '../../config.ts'

import { lazy, Suspense, useEffect } from 'react'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'
import { useZoom } from '../../hooks/Canvas/useZoom.ts'

import { PlusIcon, MinusIcon } from '../../common/components/Icons.tsx'

const LazyOffscreenCanvasDev = lazy(() => import('./OffscreenCanvasDev.tsx'))

interface CanvasProps {
  currentToolSelected: AvailableToolsNames;
  toggleTool: (desiredTool: AvailableToolsNames) => void
}

export type ExpandedImageInformation = ClippedImageBytesResponse[]

export function UICanvas ({ currentToolSelected, toggleTool }: CanvasProps) {
  const { zoom, zoomIn, zoomOut, restoreZoom } = useZoom()

  const {
    UICanvas,
    UICanvasContainer
  } = useUICanvas()
  const {
    offscreenCanvas,
    offscreenCanvasContext2D,
    offscreenCanvasImageBytes
  } = useOffscreenCanvas()

  useEffect(() => {
    if (offscreenCanvasImageBytes.byteLength === 0 ||
      !offscreenCanvas.current ||
      !offscreenCanvasContext2D.current) return

    const { width, height } = offscreenCanvas.current

    const imageData = offscreenCanvasContext2D.current.createImageData(width, height)
    imageData.data.set(offscreenCanvasImageBytes)
    offscreenCanvasContext2D.current.putImageData(imageData, 0, 0)
  }, [offscreenCanvasImageBytes, offscreenCanvas, offscreenCanvasContext2D])

  useEffect(() => {
    const onToggleTool = (e: CustomEvent<AvailableToolsNames>) => {
      const desiredTool = e.detail

      if (currentToolSelected !== 'Crop' && desiredTool === 'Crop') restoreZoom()

      if (currentToolSelected === 'Crop' && desiredTool !== 'Crop') {
        const doCrop = () => {
          console.warn('crop exec')
        }

        doCrop()
      }

      toggleTool(desiredTool)
    }

    window.addEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)

    return () => {
      window.removeEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)
    }
  }, [currentToolSelected, restoreZoom, toggleTool])

  return (
    <>
      <div
        className='UICanvas_container'
        ref={UICanvasContainer}
        style={{ position: 'relative' }}
      >
        <Suspense>
          {IS_DEVELOPMENT && <LazyOffscreenCanvasDev />}
        </Suspense>
        <canvas
          className='UICanvas'
          ref={UICanvas}
        />
        <section className='zoom-controls_container'>
          <div
            title='Zoom In'
            onClick={() => zoomIn()}
            style={{
              backgroundColor: zoom.level < ZOOM_LIMITS.MAX ? 'var(--btnBackground)' : 'transparent',
              cursor: zoom.level < ZOOM_LIMITS.MAX ? 'pointer' : 'auto'
            }}
          >
            <PlusIcon />
          </div>
          <div
            title='Zoom Out'
            onClick={() => zoomOut()}
            style={{
              backgroundColor: zoom.level > ZOOM_LIMITS.MIN ? 'var(--btnBackground)' : 'transparent',
              cursor: zoom.level > ZOOM_LIMITS.MIN ? 'pointer' : 'auto'
            }}
          >
            <MinusIcon />
          </div>
          <span>{Math.floor(zoom.level * 100)}%</span>
        </section>
      </div>
    </>
  )
}
