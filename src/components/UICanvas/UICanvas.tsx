import './UICanvas.css'

import { type EventListener } from '../../types/types.ts'
import { AVAILABLE_TOOLS } from '../Tools/tools.tsx'

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
  currentToolSelected: AVAILABLE_TOOLS;
  toggleTool: (desiredTool: AVAILABLE_TOOLS) => void
}

export function UICanvas ({ currentToolSelected, toggleTool }: CanvasProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true)

  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer,
    UICanvasImageData
  } = useUICanvas()

  const {
    offscreenCanvas,
    offscreenCanvasContext2D,
    offscreenCanvasImageData
  } = useOffscreenCanvas()

  const {
    zoom,
    zoomIn,
    zoomOut,
    restoreZoom,
    onWheelChange,
    onTouchStart,
    onTouchChange,
    transformedImageData
  } = useZoom({ currentToolSelected })

  const onToggleTool = useCallback((e: CustomEvent<AVAILABLE_TOOLS>) => {
    const desiredTool = e.detail

    if (currentToolSelected !== AVAILABLE_TOOLS.CROP &&
      desiredTool === AVAILABLE_TOOLS.CROP) {
      restoreZoom()
    }

    toggleTool(desiredTool)
  }, [currentToolSelected, toggleTool, restoreZoom])

  useLayoutEffect(() => {
    if (!transformedImageData || !UICanvas.current || !UICanvasContext2D.current) return

    const { width: UICanvasWidth, height: UICanvasHeight } = transformedImageData

    UICanvas.current.width = UICanvasWidth
    UICanvas.current.height = UICanvasHeight

    UICanvasContext2D.current.putImageData(transformedImageData, 0, 0)

    window.addEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)

    return () => {
      window.removeEventListener(EVENTS.TOGGLE_TOOL, onToggleTool as EventListener)
    }
  }, [transformedImageData, UICanvas, UICanvasContext2D, onToggleTool])

  useEffect(() => {
    if (!offscreenCanvasImageData ||
      !offscreenCanvas.current ||
      !offscreenCanvasContext2D.current) return

    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvasImageData

    offscreenCanvas.current.width = offscreenCanvasWidth
    offscreenCanvas.current.height = offscreenCanvasHeight

    offscreenCanvasContext2D.current.putImageData(offscreenCanvasImageData, 0, 0)
  }, [offscreenCanvasImageData, offscreenCanvas, offscreenCanvasContext2D])

  return (
    <div
      className='UICanvas-container'
      ref={UICanvasContainer}
      style={{ position: 'relative' }}
    >
      <Suspense>
        {IS_DEVELOPMENT && <LazyOffscreenCanvasDev />}
      </Suspense>
      <canvas
        className='UICanvas'
        ref={UICanvas}

        onWheel={onWheelChange}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchChange}
      />
      <div
        className='transparent-background'
        style={{
          opacity: isBannerVisible ? 1 : 0,
          width: UICanvasImageData ? UICanvasImageData.width : 0,
          height: UICanvasImageData ? UICanvasImageData.height : 0
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
      {
        currentToolSelected === AVAILABLE_TOOLS.CROP && (
          <OverlayCanvas currentToolSelected={currentToolSelected} />
        )
      }
      <section
        className='zoom-controls-container'
        style={{
          pointerEvents: currentToolSelected === AVAILABLE_TOOLS.CROP ? 'none' : 'auto'
        }}
      >
        <div
          title='Zoom In'
          onClick={() => zoomIn()}
          style={{
            backgroundColor: zoom.level >= ZOOM_LIMITS.MAX || currentToolSelected === AVAILABLE_TOOLS.CROP
              ? 'transparent'
              : 'var(--btnBackground)',
            cursor: zoom.level >= ZOOM_LIMITS.MAX || currentToolSelected === AVAILABLE_TOOLS.CROP
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
            backgroundColor: zoom.level <= ZOOM_LIMITS.MIN || currentToolSelected === AVAILABLE_TOOLS.CROP
              ? 'transparent'
              : 'var(--btnBackground)',
            cursor: zoom.level <= ZOOM_LIMITS.MIN || currentToolSelected === AVAILABLE_TOOLS.CROP
              ? 'auto'
              : 'pointer'
          }}
        >
          <MinusIcon />
        </div>
        <span>{Math.floor(zoom.level * 100)}%</span>
      </section>
    </div>
  )
}
