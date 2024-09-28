import { type DIRECTION, RESTORE, type FILTERS } from '../../consts.ts'
import { IMAGE_DATA_ACTION_TYPES, type cropPayload } from '../../reducer-like/ImageData.ts'

import { USABLE_CANVAS } from '../../consts.ts'

import { useActionMiddleware } from './useActionMiddleware.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'
import { useUICanvas } from '../Canvas/useUICanvas.ts'

import { getImageResize } from '../../methods/getImageResize.ts'
import { getScaledImageData } from '../../methods/getScaledImage.ts'
import { dispatchWarning } from '../../methods/dispatchWarning.ts'

export function useAction () {
  const { setInitialCharge, clearCanvas, actionMiddleware } = useActionMiddleware()
  const { UILogs, getIndexOfLogOnRestore } = useLogs()

  const { UICanvasContainer } = useUICanvas()

  const restoreCanvas = async (restoreType: RESTORE) => {
    const indexOfDesiredLog = getIndexOfLogOnRestore(restoreType)

    if (indexOfDesiredLog === null) return

    const offscreenLogDataMock = {
      width: 0,
      height: 0,
      compressedImageBytes: new Uint8Array()
    }

    actionMiddleware({
      type: IMAGE_DATA_ACTION_TYPES.RESTORE,
      payload: [
        {
          logData: UILogs[indexOfDesiredLog].data,
          newIndexOfCurrentState: indexOfDesiredLog
        },
        {
          logData: offscreenLogDataMock, // this value will be replaced later
          newIndexOfCurrentState: indexOfDesiredLog
        }
      ]
    })
  }

  const invertCanvas = () => {
    actionMiddleware({
      type: IMAGE_DATA_ACTION_TYPES.INVERT
    })
  }

  const rotateCanvas = (direction: DIRECTION) => {
    actionMiddleware({
      type: IMAGE_DATA_ACTION_TYPES.ROTATE,
      payload: { direction }
    })
  }

  const cropCanvas = (proportions: cropPayload) => {
    if (Object.values(proportions).some(p => p < 0 || p > 1)) {
      console.error('When crop, all proportions must be both greater or equal 0 and less or equal 1.')

      return
    }

    actionMiddleware({
      type: IMAGE_DATA_ACTION_TYPES.CROP,
      payload: proportions
    }, (clippedImageData, usingCanvas) => {
      if (usingCanvas === USABLE_CANVAS.DOWNLOADABLE_CANVAS) return

      const { width: widthOfClippedImageData, height: heightOfClippedImageData } = clippedImageData
      const { offsetWidth: containerWidth, offsetHeight: containerHeight } = UICanvasContainer.current!

      const { scaleX, scaleY } = getImageResize({
        originalWidth: widthOfClippedImageData,
        originalHeight: heightOfClippedImageData,
        containerWidth,
        containerHeight
      })

      const scale = (scaleX + scaleY) / 2
      const scaledImageData = getScaledImageData(clippedImageData, scale)

      if (!(scaledImageData instanceof ImageData)) {
        dispatchWarning({
          message: 'The image could not be enlarged.',
          color: 'yellow'
        })

        return
      }

      return scaledImageData
    })
  }

  const applyFilter = (filter: FILTERS) => {
    actionMiddleware({
      type: IMAGE_DATA_ACTION_TYPES.FILTER,
      payload: { filter }
    })
  }

  return { setInitialCharge, clearCanvas, restoreCanvas, invertCanvas, rotateCanvas, cropCanvas, applyFilter }
}
