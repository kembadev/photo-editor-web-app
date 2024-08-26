import { useCallback } from 'react'
import { useImageFile } from './useImageFile.ts'
import { useUICanvas } from './useUICanvas.ts'
import { useOffscreenCanvas } from './useOffscreenCanvas.ts'
import { useControls } from './useControls.ts'

import { getImageResize } from '../methods/getImageResize.ts'
import { getImageBytes } from '../methods/getImageBytes.ts'
import { dispatchWarning } from '../methods/dispatchWarning.ts'

export function useLoadEditor () {
  const { providedImgFile } = useImageFile()

  const {
    UICanvas,
    UICanvasContext2D,
    UICanvasContainer
  } = useUICanvas()
  const {
    offscreenCanvas,
    offscreenCanvasContext2D
  } = useOffscreenCanvas()

  const { setInitialCharge } = useControls()

  const onLoadImage = useCallback((imgElement: HTMLImageElement, aborter: AbortController) => {
    aborter.abort()

    const { height: imgHeight, width: imgWidth } = imgElement

    offscreenCanvas.current = new OffscreenCanvas(imgWidth, imgHeight)

    const offscreenContext = offscreenCanvas.current.getContext('2d', { willReadFrequently: true })!
    offscreenCanvasContext2D.current = offscreenContext
    offscreenContext.drawImage(imgElement, 0, 0)

    const { offsetWidth: UIContainerWidth, offsetHeight: UIContainerHeight } = UICanvasContainer.current!

    const { scaleX, scaleY } = getImageResize({
      originalHeight: imgHeight,
      originalWidth: imgWidth,
      containerHeight: UIContainerHeight,
      containerWidth: UIContainerWidth
    })

    const UICanvasWidth = scaleX * imgWidth
    const UICanvasHeight = scaleY * imgHeight

    UICanvas.current!.width = UICanvasWidth
    UICanvas.current!.height = UICanvasHeight

    const UIContext = UICanvas.current!.getContext('2d', { willReadFrequently: true })!
    UICanvasContext2D.current = UIContext
    UIContext.drawImage(imgElement, 0, 0, UICanvasWidth, UICanvasHeight)

    const initialOffscreenCanvasImageBytes = getImageBytes({
      ctx: offscreenContext,
      canvasWidth: imgWidth,
      canvasHeight: imgHeight
    })

    const initialUICanvasImageBytes = getImageBytes({
      ctx: UIContext,
      canvasWidth: UICanvasWidth,
      canvasHeight: UICanvasHeight
    })

    const areInitialImageBytesInvalid = !(initialOffscreenCanvasImageBytes instanceof Uint8Array) ||
      !(initialUICanvasImageBytes instanceof Uint8Array)

    if (areInitialImageBytesInvalid) {
      // discard()
      const doesMemmoryExceed = initialOffscreenCanvasImageBytes === 'RangeError' ||
        initialUICanvasImageBytes === 'RangeError'

      if (doesMemmoryExceed) {
        dispatchWarning('Image is too large to work with.')
        return
      }

      dispatchWarning('Something went wrong. Try again later.')
      return
    }

    setInitialCharge({
      initialOffscreenCanvasImageBytes,
      initialUICanvasImageBytes
    })
  }, [UICanvas, UICanvasContext2D, UICanvasContainer, offscreenCanvas, offscreenCanvasContext2D, setInitialCharge])

  const onLoadEditor = useCallback((fn?: () => void) => {
    if (!providedImgFile) return

    const blob = new Blob([providedImgFile], { type: providedImgFile.type })
    const url = URL.createObjectURL(blob)
    const imgElement = document.createElement('img')
    imgElement.src = url

    const aborter = new AbortController()

    imgElement.addEventListener('load', e => {
      onLoadImage(e.target as HTMLImageElement, aborter)
      if (fn) fn()
    }, { signal: aborter.signal })
  }, [providedImgFile, onLoadImage])

  return { onLoadEditor }
}
