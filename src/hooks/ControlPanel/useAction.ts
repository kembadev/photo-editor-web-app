import { type DIRECTION, RESTORE } from '../../consts.ts'
import { IMAGE_BYTES_ACTION_TYPES } from '../../reducer-like/ImageBytes.ts'

import { useActionMiddleware } from './useActionMiddleware.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'

export function useAction () {
  const { setInitialCharge, clearCanvas, actionMiddleware } = useActionMiddleware()
  const {
    getIndexOfDesiredLog,
    getUILog,
    restoreUI,
    restoreOffscreen
  } = useLogs()

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

  return { setInitialCharge, clearCanvas, restoreCanvas, invertCanvas, rotateCanvas }
}
