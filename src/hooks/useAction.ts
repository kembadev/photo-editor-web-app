import { type DIRECTION } from '../consts.ts'
import { IMAGE_BYTES_ACTION_TYPES } from '../reducer-like/ImageBytes.ts'

import { useActionMiddleware } from './useActionMiddleware.ts'
import { useUICanvas } from './useUICanvas.ts'

export function useAction () {
  const { setInitialCharge, clearCanvas, actionMiddleware, taskRunningChecker } = useActionMiddleware()
  const { UICanvas } = useUICanvas()

  const invertCanvas = () => {
    actionMiddleware({
      type: IMAGE_BYTES_ACTION_TYPES.INVERT,
      payload: {
        canvasWidth: UICanvas.current!.width
      }
    })
  }

  const rotateCanvas = (direction: DIRECTION) => {
    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current!

    actionMiddleware({
      type: IMAGE_BYTES_ACTION_TYPES.ROTATE,
      payload: {
        direction,
        canvasWidth: UICanvasWidth,
        canvasHeight: UICanvasHeight
      }
    }, (canvas) => {
      const { width, height } = canvas

      canvas.width = height
      canvas.height = width
    })
  }

  return { setInitialCharge, clearCanvas, taskRunningChecker, invertCanvas, rotateCanvas }
}
