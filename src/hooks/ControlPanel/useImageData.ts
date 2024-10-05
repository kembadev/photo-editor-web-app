import { type ReducerAction } from '../../reducer-like/ImageData.ts'
import { type Log } from '../../context/Editor/LogsProvider.tsx'

import { IMAGE_DATA_ACTION_TYPES } from '../../reducer-like/ImageData.ts'

import { useCallback, useEffect } from 'react'
import { useUICanvas } from '../Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../Canvas/useOffscreenCanvas.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'
import { useProcessesChecker } from '../../common/hooks/useProcessesChecker.ts'

import { getImageResize } from '../../methods/getImageResize.ts'
import { getScaledImageData } from '../../methods/getScaledImage.ts'

interface UICanvasImageDataHandlerProps {
  action: ReducerAction;
  updatedImageData: ImageData
}

interface DownloadableCanvasImageDataHandlerProps {
  action: ReducerAction;
  prevLogs: Log[];
  updatedImageData: ImageData
}

export function useImageData () {
  const { setUICanvasImageData, UICanvasContainer } = useUICanvas()
  const { setOffscreenCanvasImageData, offscreenCanvasImageData } = useOffscreenCanvas()

  const { addUILog, restoreUILogs, addLog, restoreLogs } = useLogs()

  const { taskRunningChecker } = useProcessesChecker()

  const UICanvasImageDataHandler = useCallback(async ({
    action,
    updatedImageData
  }: UICanvasImageDataHandlerProps) => {
    setUICanvasImageData(updatedImageData)

    const { type } = action

    if (type === IMAGE_DATA_ACTION_TYPES.RESTORE) {
      restoreUILogs(action.payload.newIndexOfCurrentState)
      return
    }

    await addUILog(updatedImageData)
  }, [setUICanvasImageData, addUILog, restoreUILogs])

  const offscreenCanvasImageDataHandler = useCallback(async ({
    action,
    prevLogs,
    updatedImageData
  }: DownloadableCanvasImageDataHandlerProps) => {
    setOffscreenCanvasImageData(updatedImageData)

    const { type } = action

    const updatedLogs = type === IMAGE_DATA_ACTION_TYPES.RESTORE
      ? restoreLogs({
        prevLogs,
        newIndexOfCurrentState: action.payload.newIndexOfCurrentState
      })
      : await addLog({ prevLogs, imageData: updatedImageData })

    return { updatedLogs }
  }, [setOffscreenCanvasImageData, addLog, restoreLogs])

  useEffect(() => {
    if (!offscreenCanvasImageData ||
      !UICanvasContainer.current ||
      !taskRunningChecker.isQueueClear) return

    const { width: originalWidth, height: originalHeight } = offscreenCanvasImageData
    const { offsetWidth: containerWidth, offsetHeight: containerHeight } = UICanvasContainer.current

    const { scaleX, scaleY } = getImageResize({
      originalWidth,
      originalHeight,
      containerWidth,
      containerHeight
    })
    const scale = Math.min(scaleX, scaleY)

    if (scale < 0.2 || scale > 1) return

    const scaledImageData = getScaledImageData(offscreenCanvasImageData, scale)

    if (!(scaledImageData instanceof ImageData)) return

    setUICanvasImageData(scaledImageData)
  }, [offscreenCanvasImageData, taskRunningChecker, setUICanvasImageData, UICanvasContainer])

  return { UICanvasImageDataHandler, offscreenCanvasImageDataHandler }
}
