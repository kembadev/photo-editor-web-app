import { type Action } from '../../types/action-middleware.ts'

import { EVENTS } from '../../consts.ts'

import { useContext, useCallback, useRef } from 'react'
import { useUICanvas } from '../Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../Canvas/useOffscreenCanvas.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'
import { UICanvasContext } from '../../context/Canvas/UICanvasContext.ts'
import { OffscreenCanvasContext } from '../../context/Canvas/OffscreenCanvasContext.ts'

import { getUpdatedImageBytes, IMAGE_BYTES_ACTION_TYPES, initialImageBytes, type ReducerAction } from '../../reducer-like/ImageBytes.ts'

import { getTaskGluer, type EnqueueTask } from '../../core/actionTaskQueue.ts'
import { dispatchWarning } from '../../methods/dispatchWarning.ts'
import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'

export interface InitialCharge {
  initialUICanvasImageBytes: Uint8Array;
  initialOffscreenCanvasImageBytes: Uint8Array
}

type Cb = (canvas: HTMLCanvasElement | OffscreenCanvas) => Promise<void> | void

export function useActionMiddleware () {
  const UIContext = useContext(UICanvasContext)
  const OffscreenContext = useContext(OffscreenCanvasContext)

  if (UIContext === undefined || OffscreenContext === undefined) {
    throw new ContextProviderNotFound(
      'useActionMiddleware must be used in both a UICanvasProvider and an OffscreenCanvasProvider.'
    )
  }

  const { UICanvas, UICanvasContext2D, UICanvasImageBytes } = useUICanvas()
  const { offscreenCanvas, offscreenCanvasContext2D } = useOffscreenCanvas()

  const { setUICanvasImageBytes } = UIContext
  const { setOffscreenCanvasImageBytes } = OffscreenContext

  const { addUILog, addOffscreenLog } = useLogs()

  const isFirstOverload = useRef(true)
  const enqueueTask = useRef<EnqueueTask | null>(null)
  const isMiddlewareBlocked = useRef(false)

  const setInitialCharge = useCallback(({
    initialUICanvasImageBytes,
    initialOffscreenCanvasImageBytes
  }: InitialCharge) => {
    if (!UICanvas.current || !offscreenCanvas.current) return

    if (!isFirstOverload.current) {
      throw new Error('setInitialCharge function already was used.')
    }

    isFirstOverload.current = false

    setUICanvasImageBytes(initialUICanvasImageBytes)
    setOffscreenCanvasImageBytes(initialOffscreenCanvasImageBytes)

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current
    const { width: offscreenWidth, height: offscreenHeight } = offscreenCanvas.current

    addUILog({
      imageBytes: initialUICanvasImageBytes,
      canvasWidth: UICanvasWidth,
      canvasHeight: UICanvasHeight
    })

    addOffscreenLog({
      imageBytes: initialOffscreenCanvasImageBytes,
      canvasWidth: offscreenWidth,
      canvasHeight: offscreenHeight
    })

    enqueueTask.current = getTaskGluer({
      initialImageBytes: initialOffscreenCanvasImageBytes,
      lastImageBytesHandler: (lastImageBytes, type) => {
        setOffscreenCanvasImageBytes(lastImageBytes)

        const { width, height } = offscreenCanvas.current!

        if (type === IMAGE_BYTES_ACTION_TYPES.RESTORE) return

        return addOffscreenLog({
          imageBytes: lastImageBytes,
          canvasWidth: width,
          canvasHeight: height
        })
      }
    })
  }, [UICanvas, offscreenCanvas, setOffscreenCanvasImageBytes, setUICanvasImageBytes, addUILog, addOffscreenLog])

  const clearCanvas = useCallback(() => {
    const terminateWorkerEvent = new Event(EVENTS.TERMINATE_OFFSCREEN_CANVAS_WORKER)
    window.dispatchEvent(terminateWorkerEvent)

    isFirstOverload.current = true
    isMiddlewareBlocked.current = false

    offscreenCanvas.current = null
    UICanvasContext2D.current = null
    offscreenCanvasContext2D.current = null

    setUICanvasImageBytes(initialImageBytes)
    setOffscreenCanvasImageBytes(initialImageBytes)
  }, [offscreenCanvas, UICanvasContext2D, offscreenCanvasContext2D, setUICanvasImageBytes, setOffscreenCanvasImageBytes])

  const actionMiddleware = useCallback(async <T extends IMAGE_BYTES_ACTION_TYPES>(
    { type, payload }: Action<T>,
    fn?: Cb
  ) => {
    if (isFirstOverload.current ||
      !enqueueTask.current ||
      isMiddlewareBlocked.current ||
      !UICanvas.current ||
      !offscreenCanvas.current) return

    isMiddlewareBlocked.current = true

    const { width: UICanvasWidth, height: UICanvasHeight } = UICanvas.current

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

    let result

    const UICanvasDimensions = {
      canvasWidth: UICanvasWidth,
      canvasHeight: UICanvasHeight
    }

    try {
      result = await getUpdatedImageBytes({
        state: UICanvasImageBytes,
        action: UIAction,
        canvasDimensions: UICanvasDimensions
      })

      if (result instanceof Error) throw result
    } catch (err) {
      isMiddlewareBlocked.current = false

      if (err instanceof Error) {
        if (err.name === 'InternetConnectionDownException') return dispatchWarning(err.message)

        return dispatchWarning('Something went wrong.')
      }

      return
    }

    setUICanvasImageBytes(result)

    if (fn) await fn(UICanvas.current)

    // when restore, not add a new log
    if (type !== IMAGE_BYTES_ACTION_TYPES.RESTORE) {
      const { width, height } = UICanvas.current
      addUILog({
        imageBytes: result,
        canvasWidth: width,
        canvasHeight: height
      })
    }

    const getOffscreenCanvasDimensions = () => {
      const { width, height } = offscreenCanvas.current!
      return { canvasWidth: width, canvasHeight: height }
    }

    const offscreenQueuedFn = async () => {
      if (fn) {
        await fn(offscreenCanvas.current!)
      }
    }

    const offscreenAction = { type, payload: offscreenPayload } as ReducerAction

    enqueueTask.current({
      action: offscreenAction,
      getCanvasDimensions: getOffscreenCanvasDimensions,
      queuedFn: offscreenQueuedFn
    })

    isMiddlewareBlocked.current = false
  }, [UICanvas, offscreenCanvas, UICanvasImageBytes, setUICanvasImageBytes, addUILog])

  return { setInitialCharge, clearCanvas, actionMiddleware }
}
