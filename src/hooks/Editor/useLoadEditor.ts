import { useCallback } from 'react'
import { useImageFile } from '../../common/hooks/useImageFile.ts'
import { useUICanvas } from '../Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../Canvas/useOffscreenCanvas.ts'
import { useControls } from '../ControlPanel/useControls.ts'
import { useDiscardImage } from '../../common/hooks/useDiscardImage.ts'

import { getImageResize } from '../../methods/getImageResize.ts'
import { getImageDataFromContext, type GetImageDataReturnValue } from '../../methods/getImageData.ts'
import { dispatchWarning } from '../../methods/dispatchWarning.ts'

import { ImageError } from '../../error-handling/ImageError.ts'

function isSampleImageData (sample: GetImageDataReturnValue): sample is ImageData {
  return sample instanceof ImageData
}

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
  const { discardImage } = useDiscardImage()

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

    const initialOffscreenCanvasImageData = getImageDataFromContext({
      ctx: offscreenContext,
      width: imgWidth,
      height: imgHeight
    })

    const initialUICanvasImageData = getImageDataFromContext({
      ctx: UIContext,
      width: UICanvasWidth,
      height: UICanvasHeight
    })

    const areBothSamplesValid = isSampleImageData(initialOffscreenCanvasImageData) &&
      isSampleImageData(initialUICanvasImageData)

    if (areBothSamplesValid) {
      setInitialCharge({
        initialOffscreenCanvasImageData,
        initialUICanvasImageData
      })

      return
    }

    discardImage()

    const samples = [initialOffscreenCanvasImageData, initialUICanvasImageData]

    const imageError = samples.find(sample => sample instanceof ImageError)

    if (imageError) {
      dispatchWarning(imageError.message)
      return
    }

    dispatchWarning('Something went wrong. Try again later.')
  }, [UICanvas, UICanvasContext2D, UICanvasContainer, offscreenCanvas, offscreenCanvasContext2D, discardImage, setInitialCharge])

  const onEditorLoad = useCallback((fn?: () => void) => {
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

  return { onEditorLoad }
}
