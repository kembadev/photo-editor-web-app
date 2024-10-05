import './UICanvas.css'

import { type EventListener } from '../../types/types.ts'
import { AVAILABLE_TOOLS } from '../Tools/tools.tsx'

import { EVENTS, ZOOM_LIMITS } from '../../consts.ts'
import { IS_DEVELOPMENT } from '../../config.ts'

import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'
import { useZoom } from '../../hooks/Canvas/useZoom.ts'
import { useDiscardImage } from '../../common/hooks/useDiscardImage.ts'

import { PlusIcon, MinusIcon, XIcon, DownloadIcon } from '../../common/components/Icons.tsx'
import { OverlayCanvas } from './OverlayCanvas.tsx'

import DownloadModal, { type DownloadModalHandle } from '../DownloadModal/DownloadModal.tsx'

const LazyOffscreenCanvasDev = lazy(() => import('./OffscreenCanvasDev.tsx'))

interface CanvasProps {
  currentToolSelected: AVAILABLE_TOOLS
}

export function UICanvas ({ currentToolSelected }: CanvasProps) {
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

  const { discardImage } = useDiscardImage()

  const downloadModalRef = useRef<DownloadModalHandle>(null)

  const openDownloadModal = () => {
    downloadModalRef.current?.showModal()
  }

  // update UICanvasRef

  const onToggleTool = useCallback((e: CustomEvent<AVAILABLE_TOOLS>) => {
    if (e.detail === AVAILABLE_TOOLS.CROP) restoreZoom()
  }, [restoreZoom])

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

  // update offscreenCanvasRef

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
    <>
      <article className='UICanvas-container'>
        <div>
          <div className='non-destructive-actions'>
            <button
              title='Toggle transparent background'
              className='transparent-background--btn-controller btn-unpainted btn-clickable'
              onClick={() => {
                setIsBannerVisible(!isBannerVisible)
              }}
            >
              <span>
                {
                  isBannerVisible
                    ? 'Hide transparent background'
                    : 'Show transparent background'
                }
              </span>
              <div
                style={{
                  left: isBannerVisible ? 'calc(100% - var(--ball-size))' : 0,
                  opacity: isBannerVisible ? 1 : 0.55
                }}
              />
            </button>
            <section
              className='zoom-controls'
              style={{
                pointerEvents: currentToolSelected === AVAILABLE_TOOLS.CROP ? 'none' : 'auto'
              }}
            >
              <div>
                <button
                  title='Zoom In'
                  className={
                    zoom.level >= ZOOM_LIMITS.MAX || currentToolSelected === AVAILABLE_TOOLS.CROP
                      ? 'btn-unpainted'
                      : 'btn-painted btn-clickable'
                  }
                  onClick={() => zoomIn()}
                >
                  <PlusIcon />
                </button>
                <button
                  title='Zoom Out'
                  className={
                    zoom.level <= ZOOM_LIMITS.MIN || currentToolSelected === AVAILABLE_TOOLS.CROP
                      ? 'btn-unpainted'
                      : 'btn-painted btn-clickable'
                  }
                  onClick={() => zoomOut()}
                >
                  <MinusIcon />
                </button>
              </div>
              <button
                title='Reset zoom'
                className='btn-unpainted btn-clickable'
                onClick={restoreZoom}
              >
                <span>{Math.floor(zoom.level * 100)}%</span>
              </button>
            </section>
          </div>
          <button
            title='Discard image'
            className='discard-image--btn btn-unpainted'
            onClick={discardImage}
          >
            <XIcon />
          </button>
        </div>
        <header className='UICanvas__user-view' ref={UICanvasContainer}>
          <button
            title='Download image'
            className='save-image--btn btn-unpainted btn-clickable'
            aria-describedby='download-modal'
            onClick={openDownloadModal}
          >
            <DownloadIcon />
          </button>
          <canvas
            ref={UICanvas}
            className='UICanvas'
            style={
              UICanvasImageData
                ? {
                    width: `${UICanvasImageData.width}px`,
                    height: `${UICanvasImageData.height}px`
                  }
                : {
                    width: 0,
                    height: 0
                  }
            }

            onWheel={onWheelChange}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchChange}
          />
          {currentToolSelected === AVAILABLE_TOOLS.CROP && <OverlayCanvas />}
          {
            (isBannerVisible && UICanvasImageData) &&
              <div
                className='transparent-background'
                style={{
                  width: UICanvasImageData.width,
                  height: UICanvasImageData.height
                }}
              />
          }
          <Suspense>
            {IS_DEVELOPMENT && <LazyOffscreenCanvasDev />}
          </Suspense>
        </header>
      </article>
      <DownloadModal ref={downloadModalRef} />
    </>
  )
}
