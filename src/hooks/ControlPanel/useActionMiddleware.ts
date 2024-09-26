import { type Action } from '../../types/action-middleware.ts'

import { EVENTS, USABLE_CANVAS } from '../../consts.ts'

import { useCallback, useRef } from 'react'
import { useUICanvas } from '../Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../Canvas/useOffscreenCanvas.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'
import { useImageData } from './useImageData.ts'

import { getUpdatedImageData, IMAGE_DATA_ACTION_TYPES, type ReducerAction } from '../../reducer-like/ImageData.ts'

import { getTaskGluer, type EnqueueTask } from '../../core/actionTaskQueue.ts'
import { dispatchWarning } from '../../methods/dispatchWarning.ts'

export interface InitialCharge {
  initialUICanvasImageData: ImageData;
  initialOffscreenCanvasImageData: ImageData
}

export type ModifierCallback = undefined | ((
  updatedImageData: ImageData, usingCanvas: USABLE_CANVAS
) => Promise<ImageData | void> | ImageData | void)

export function useActionMiddleware () {
  const { UICanvasContext2D, UICanvasImageData, setUICanvasImageData } = useUICanvas()
  const { offscreenCanvas, offscreenCanvasContext2D, setOffscreenCanvasImageData } = useOffscreenCanvas()

  const { addUILog, addLog } = useLogs()
  const { UICanvasImageDataHandler, offscreenCanvasImageDataHandler } = useImageData()

  const isFirstOverload = useRef(true)
  const enqueueTask = useRef<EnqueueTask | null>(null)
  const isMiddlewareBlocked = useRef(false)

  const setInitialCharge = useCallback(async ({
    initialUICanvasImageData,
    initialOffscreenCanvasImageData
  }: InitialCharge) => {
    if (!isFirstOverload.current) {
      throw new Error('setInitialCharge function already was used.')
    }

    isFirstOverload.current = false

    setUICanvasImageData(initialUICanvasImageData)
    setOffscreenCanvasImageData(initialOffscreenCanvasImageData)

    addUILog(initialUICanvasImageData)

    const startingLogs = await addLog({
      prevLogs: [],
      imageData: initialOffscreenCanvasImageData
    })

    enqueueTask.current = getTaskGluer({
      startingImageData: initialOffscreenCanvasImageData,
      startingLogs: [startingLogs[0]],
      latestImageDataHandler: async ({ updatedImageData, action, prevLogs }) => {
        const { updatedLogs } = await offscreenCanvasImageDataHandler({
          action,
          prevLogs,
          updatedImageData
        })

        return { updatedLogs }
      }
    })
  }, [setOffscreenCanvasImageData, setUICanvasImageData, addUILog, addLog, offscreenCanvasImageDataHandler])

  const clearCanvas = useCallback(() => {
    const terminateWorkerEvent = new Event(EVENTS.TERMINATE_OFFSCREEN_CANVAS_WORKER)
    window.dispatchEvent(terminateWorkerEvent)

    isFirstOverload.current = true
    isMiddlewareBlocked.current = false

    offscreenCanvas.current = null
    UICanvasContext2D.current = null
    offscreenCanvasContext2D.current = null

    setUICanvasImageData(null)
    setOffscreenCanvasImageData(null)
  }, [offscreenCanvas, UICanvasContext2D, offscreenCanvasContext2D, setUICanvasImageData, setOffscreenCanvasImageData])

  const actionMiddleware = useCallback(async <T extends IMAGE_DATA_ACTION_TYPES>(
    { type, payload }: Action<T>,
    modifier?: ModifierCallback
  ) => {
    if (isFirstOverload.current ||
      !enqueueTask.current ||
      isMiddlewareBlocked.current ||
      !UICanvasImageData) return

    isMiddlewareBlocked.current = true

    let UIPayload, offscreenPayload

    if (payload !== undefined) {
      UIPayload = Array.isArray(payload)
        ? payload[0]
        : payload

      offscreenPayload = Array.isArray(payload)
        ? payload[1]
        : payload
    }

    const UIAction = { type, payload: UIPayload } as ReducerAction

    let updatedUICanvasImageData: ImageData

    try {
      updatedUICanvasImageData = await getUpdatedImageData(UICanvasImageData, UIAction)
    } catch (err) {
      isMiddlewareBlocked.current = false

      if (err instanceof Error) {
        if (err.name === 'InternetConnectionDownException') {
          return dispatchWarning(err.message)
        }

        return dispatchWarning('Something went wrong.')
      }

      return
    }

    const interceptedImageData = modifier
      ? await modifier(
        updatedUICanvasImageData,
        USABLE_CANVAS.UICANVAS
      ) ?? updatedUICanvasImageData
      : updatedUICanvasImageData

    await UICanvasImageDataHandler({ action: UIAction, updatedImageData: interceptedImageData })

    const offscreenAction = { type, payload: offscreenPayload } as ReducerAction

    enqueueTask.current({
      action: offscreenAction,
      modifierFn: modifier
    })

    isMiddlewareBlocked.current = false
  }, [UICanvasImageData, UICanvasImageDataHandler])

  return { setInitialCharge, clearCanvas, actionMiddleware }
}
