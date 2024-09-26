import { type ReducerAction } from '../../reducer-like/ImageData.ts'
import { type Log } from '../../context/Editor/LogsProvider.tsx'

import { IMAGE_DATA_ACTION_TYPES } from '../../reducer-like/ImageData.ts'

import { useCallback } from 'react'
import { useUICanvas } from '../Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../Canvas/useOffscreenCanvas.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'

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
  const { setUICanvasImageData } = useUICanvas()
  const { setOffscreenCanvasImageData } = useOffscreenCanvas()

  const { addUILog, restoreUILogs, addLog, restoreLogs } = useLogs()

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

  return { UICanvasImageDataHandler, offscreenCanvasImageDataHandler }
}
