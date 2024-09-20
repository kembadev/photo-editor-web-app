import { type DIRECTION, RESTORE } from '../../consts.ts'
import { IMAGE_BYTES_ACTION_TYPES, type cropPayload } from '../../reducer-like/ImageBytes.ts'

import { useActionMiddleware } from './useActionMiddleware.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'
import { useUICanvas } from '../Canvas/useUICanvas.ts'

import { getImageResize } from '../../methods/getImageResize.ts'

export function useAction () {
  const { setInitialCharge, clearCanvas, actionMiddleware } = useActionMiddleware()
  const {
    getIndexOfDesiredLog,
    getUILog,
    restoreUI,
    restoreOffscreen
  } = useLogs()

  const { UICanvas, UICanvasContainer } = useUICanvas()

  const restoreCanvas = async (restoreType: RESTORE) => {
    const indexOfDesiredLog = await getIndexOfDesiredLog(restoreType)

    if (indexOfDesiredLog === null) return

    const UILog = await getUILog(indexOfDesiredLog)
    const { compressedImageBytes: UICompressedImageBytes } = UILog.data

    actionMiddleware({
      type: IMAGE_BYTES_ACTION_TYPES.RESTORE,
      payload: [
        {
          compressedImageBytes: UICompressedImageBytes,
          indexOfDesiredLog
        },
        {
          compressedImageBytes: new Uint8Array(), // this value will be replaced later
          indexOfDesiredLog
        }
      ]
    }, (canvas) => {
      if (canvas instanceof OffscreenCanvas) {
        return restoreOffscreen(indexOfDesiredLog)
      }

      restoreUI(indexOfDesiredLog)
    })
  }

  const invertCanvas = () => {
    actionMiddleware({
      type: IMAGE_BYTES_ACTION_TYPES.INVERT
    })
  }

  const rotateCanvas = (direction: DIRECTION) => {
    actionMiddleware({
      type: IMAGE_BYTES_ACTION_TYPES.ROTATE,
      payload: { direction }
    }, (canvas) => {
      const { width, height } = canvas

      canvas.width = height
      canvas.height = width
    })
  }

  const cropCanvas = (proportions: cropPayload) => {
    if (Object.values(proportions).some(p => p < 0 || p > 1)) {
      console.error('When crop, all proportions must be both greater or equal 0 and less or equal 1.')

      return
    }

    const { proportionOfWidth, proportionOfHeight } = proportions

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current!
    const { offsetWidth: containerWidth, offsetHeight: containerHeight } = UICanvasContainer.current!

    const widthOfClippedImage = UICanvasWidth * proportionOfWidth
    const heightOfClippedImage = UICanvasHeight * proportionOfHeight

    const { scaleX, scaleY } = getImageResize({
      originalWidth: widthOfClippedImage,
      originalHeight: heightOfClippedImage,
      containerWidth,
      containerHeight
    })

    actionMiddleware({
      type: IMAGE_BYTES_ACTION_TYPES.CROP,
      payload: [{ ...proportions, scaling: (scaleX + scaleY) / 2 }, proportions]
    }, (canvas) => {
      if (canvas instanceof OffscreenCanvas) {
        const { width, height } = canvas

        canvas.width = width * proportionOfWidth
        canvas.height = height * proportionOfHeight

        return
      }

      // UICanvas resizing
      canvas.width = scaleX * widthOfClippedImage
      canvas.height = scaleY * heightOfClippedImage
    })
  }

  return { setInitialCharge, clearCanvas, restoreCanvas, invertCanvas, rotateCanvas, cropCanvas }
}
