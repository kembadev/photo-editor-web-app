import './UICanvas.css'

import { type EventListener } from '../../types/types.ts'
import { type AvailableToolsNames } from '../Tools/tools.tsx'

import { EVENTS, ZOOM_LIMITS } from '../../consts.ts'
import { IS_DEVELOPMENT } from '../../config.ts'

import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'
import { useZoom } from '../../hooks/Canvas/useZoom.ts'

import { PlusIcon, MinusIcon } from '../../common/components/Icons.tsx'
import { OverlayCanvas } from './OverlayCanvas.tsx'

const LazyOffscreenCanvasDev = lazy(() => import('./OffscreenCanvasDev.tsx'))

interface CanvasProps {
  currentToolSelected: AvailableToolsNames;
  toggleTool: (desiredTool: AvailableToolsNames) => void
}

export function UICanvas ({ currentToolSelected, toggleTool }: CanvasProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true)

  const { zoom, zoomIn, zoomOut, restoreZoom } = useZoom({ currentToolSelected })

  const {
    UICanvas,
    UICanvasContainer
  } = useUICanvas()
  const {
    offscreenCanvas,
    offscreenCanvasContext2D,
    offscreenCanvasImageBytes
  } = useOffscreenCanvas()

  const onToggleTool = useCallback((e: CustomEvent<AvailableToolsNames>) => {
    const desiredTool = e.detail

    if (currentToolSelected !== 'Crop' && desiredTool === 'Crop') restoreZoom()

    toggleTool(desiredTool)
  }, [currentToolSelected, toggleTool, restoreZoom])

  useEffect(() => {
    window.addEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)

    return () => {
      window.removeEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)
    }
  }, [currentToolSelected, restoreZoom, toggleTool, onToggleTool])

  useLayoutEffect(() => {
    if (offscreenCanvasImageBytes.byteLength === 0 ||
      !offscreenCanvas.current ||
      !offscreenCanvasContext2D.current) return

    const { width, height } = offscreenCanvas.current

    const imageData = offscreenCanvasContext2D.current.createImageData(width, height)
    imageData.data.set(offscreenCanvasImageBytes)
    offscreenCanvasContext2D.current.putImageData(imageData, 0, 0)
  }, [offscreenCanvasImageBytes, offscreenCanvas, offscreenCanvasContext2D])

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
        <div
          className='transparent-background'
          style={{
            width: isBannerVisible ? UICanvas.current?.width : 0,
            height: isBannerVisible ? UICanvas.current?.height : 0
          }}
        />
        <button
          title='This does not affect your image in any way'
          style={{
            backgroundColor: 'transparent',
            fontSize: '0.75rem',
            padding: '3px',
            border: '1px solid #eee',
            borderRadius: '3px',
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1000,
            opacity: 0.5
          }}
          onClick={() => {
            setIsBannerVisible(!isBannerVisible)
          }}
        >
          {isBannerVisible ? 'Hide transparent background' : 'Show transparent background'}
        </button>
        {currentToolSelected === 'Crop' && <OverlayCanvas currentToolSelected={currentToolSelected} />}
        <section
          className='zoom-controls_container'
          style={{
            pointerEvents: currentToolSelected === 'Crop' ? 'none' : 'auto'
          }}
        >
          <div
            title='Zoom In'
            onClick={() => zoomIn()}
            style={{
              backgroundColor: zoom.level >= ZOOM_LIMITS.MAX || currentToolSelected === 'Crop'
                ? 'transparent'
                : 'var(--btnBackground)',
              cursor: zoom.level >= ZOOM_LIMITS.MAX || currentToolSelected === 'Crop'
                ? 'auto'
                : 'pointer'
            }}
          >
            <PlusIcon />
          </div>
          <div
            title='Zoom Out'
            onClick={() => zoomOut()}
            style={{
              backgroundColor: zoom.level <= ZOOM_LIMITS.MIN || currentToolSelected === 'Crop'
                ? 'transparent'
                : 'var(--btnBackground)',
              cursor: zoom.level <= ZOOM_LIMITS.MIN || currentToolSelected === 'Crop'
                ? 'auto'
                : 'pointer'
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
