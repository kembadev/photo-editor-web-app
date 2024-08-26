import { type EventListener } from '../types/types.ts'

import { EVENTS } from '../consts.ts'

import { useContext, useCallback, useRef, useState, useEffect } from 'react'
import { useUICanvas } from './useUICanvas.ts'
import { useOffscreenCanvas } from './useOffscreenCanvas.ts'
import { UICanvasContext } from '../context/UICanvasContext.ts'
import { OffscreenCanvasContext } from '../context/OffscreenCanvasContext.ts'

import { getUpdatedImageBytes, type ReducerAction } from '../reducer-like/ImageBytes.ts'

import { taskGluer, type Modifier } from '../methods/handleTasksQueue.ts'
import { dispatchWarning } from '../methods/dispatchWarning.ts'

import { TypeValidation } from '../error-handling/TypeValidation.ts'

export interface InitialCharge {
  initialUICanvasImageBytes: Uint8Array;
  initialOffscreenCanvasImageBytes: Uint8Array
}

type ModifierCallback = (canvas: HTMLCanvasElement | OffscreenCanvas) => void

export interface TaskRunningChecker {
  isQueueClear: boolean;
  processesRunning: number
}

export function useActionMiddleware () {
  const UIContext = useContext(UICanvasContext)
  const OffscreenContext = useContext(OffscreenCanvasContext)

  if (UIContext === undefined || OffscreenContext === undefined) {
    throw new TypeValidation(
      'useActionMiddleware must be used in both a UICanvasProvider and an OffscreenCanvasProvider.'
    )
  }

  const [taskRunningChecker, setTaskRunningChecker] = useState<TaskRunningChecker>({
    isQueueClear: true,
    processesRunning: 0
  })

  const { UICanvas, UICanvasImageBytes } = useUICanvas()
  const { offscreenCanvas } = useOffscreenCanvas()

  const { setUICanvasImageBytes } = UIContext
  const { setOffscreenCanvasImageBytes } = OffscreenContext

  const isFirstOverload = useRef(true)
  const enqueueTask = useRef<((action: ReducerAction, fn?: Modifier) => void) | null>(null)

  const setInitialCharge = useCallback(({
    initialUICanvasImageBytes,
    initialOffscreenCanvasImageBytes
  }: InitialCharge) => {
    if (!isFirstOverload.current) throw new Error('setInitialCharge function already was used.')

    isFirstOverload.current = false

    setUICanvasImageBytes(initialUICanvasImageBytes)
    setOffscreenCanvasImageBytes(initialOffscreenCanvasImageBytes)

    enqueueTask.current = taskGluer({
      initialImageBytes: initialOffscreenCanvasImageBytes,
      updateOffscreenCanvasImageBytes: setOffscreenCanvasImageBytes,
      offscreenCanvas: offscreenCanvas.current!
    })
  }, [offscreenCanvas, setOffscreenCanvasImageBytes, setUICanvasImageBytes])

  // since clear, terminate worker, empty queue
  // this can be controlled through an event dispatcher
  const clearCanvas = () => {
    console.log('canvas clear')

    // setUICanvasImageBytes(initialImageBytes)
    // setOffscreenCanvasImageBytes(initialImageBytes)
  }

  const actionMiddleware = async (action: ReducerAction, fn?: ModifierCallback) => {
    if (isFirstOverload.current || !enqueueTask.current) return

    try {
      const result = await getUpdatedImageBytes(UICanvasImageBytes, action)

      if (result instanceof Error) throw result
      if (result === undefined) throw new Error('Something went wrong.')

      setUICanvasImageBytes(result)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NetworkError') return dispatchWarning(err.message)

        dispatchWarning('Something went wrong. Try again later.')
      }

      return
    }

    if (fn) fn(UICanvas.current!)

    enqueueTask.current(action, fn)
  }

  const onRunningTask = useCallback((e: CustomEvent<number>) => {
    const processesRunning = e.detail

    setTaskRunningChecker({
      isQueueClear: processesRunning === 0,
      processesRunning
    })
  }, [])

  useEffect(() => {
    window.addEventListener(EVENTS.TASK_PROCESSING, onRunningTask as EventListener)

    return () => {
      window.removeEventListener(EVENTS.TASK_PROCESSING, onRunningTask as EventListener)
    }
  }, [onRunningTask])

  return { setInitialCharge, clearCanvas, actionMiddleware, taskRunningChecker }
}
