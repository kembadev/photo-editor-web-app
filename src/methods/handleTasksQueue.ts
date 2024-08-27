import { type FnDefType } from '../types/types.ts'
import { type ReducerAction } from '../reducer-like/ImageBytes.ts'

import { EVENTS } from '../consts.ts'
import { IS_DEVELOPMENT } from '../config.ts'

import { TaskQueue } from '../utils/TaskQueue.ts'

import OffscreenCanvasWorker from '../dedicated-workers/offscreenCanvas.ts?worker'

export type Modifier = FnDefType<OffscreenCanvas> | undefined

type QueueType = [ReducerAction, Modifier]

type UpdateOffscreenCanvasImageBytes = FnDefType<Uint8Array>

interface TaskGluer {
  initialImageBytes: Uint8Array;
  updateOffscreenCanvasImageBytes: UpdateOffscreenCanvasImageBytes;
  offscreenCanvas: OffscreenCanvas
}

const queue = new TaskQueue<QueueType>()

const dispatchTaskProcessingEvent = () => {
  const taskProcessingEvent = new CustomEvent(
    EVENTS.TASK_PROCESSING,
    { detail: queue.getTasksLength() }
  )
  window.dispatchEvent(taskProcessingEvent)
}

function doJob (updateOffscreenCanvasImageBytes: UpdateOffscreenCanvasImageBytes, offscreenCanvas: OffscreenCanvas) {
  const worker = new OffscreenCanvasWorker({
    name: 'OFFSCREEN_CANVAS_WORKER'
  })

  const onWorkerTerminate = () => {
    worker.terminate()
    queue.clear()
  }

  window.addEventListener(EVENTS.TERMINATE_OFFSCREEN_CANVAS_WORKER, onWorkerTerminate)

  let isFirstJob = true
  let isTaskRunning = false
  let latestImageBytes: Uint8Array

  let itemIndex = 0

  return (imageBytes: Uint8Array) => {
    dispatchTaskProcessingEvent()

    if (queue.getTasksLength() === 0 || isTaskRunning) return

    const tick = performance.now()

    if (isFirstJob) {
      isFirstJob = false
      latestImageBytes = imageBytes
    }

    isTaskRunning = true

    const [action, fn] = queue.dequeue()!

    if ('payload' in action) {
      const { width: OffscreenCanvasWidth, height: OffscreenCanvasHeight } = offscreenCanvas

      if ('canvasWidth' in action.payload) action.payload.canvasWidth = OffscreenCanvasWidth

      if ('canvasHeight' in action.payload) action.payload.canvasHeight = OffscreenCanvasHeight
    }

    worker.postMessage({ latestImageBytes, action })

    worker.onmessage = (e: MessageEvent<ArrayBufferLike>) => {
      if (fn) fn(offscreenCanvas)

      const newOffscreenCanvasImageBytes = new Uint8Array(e.data)

      updateOffscreenCanvasImageBytes(newOffscreenCanvasImageBytes)

      isTaskRunning = false
      latestImageBytes = newOffscreenCanvasImageBytes

      if (IS_DEVELOPMENT) {
        if (itemIndex % 5 === 0 && itemIndex !== 0) console.clear()

        const { type } = action
        const tock = performance.now()

        console.info(`
          Task number ${++itemIndex}. Action type: ${type}.
          ${'payload' in action && JSON.stringify({ payload: action.payload }, null, 2)}
          Processing time: ${tock - tick}ms.
          Bytelength of new offscreenCanvasImageBytes: ${newOffscreenCanvasImageBytes.byteLength}.
        `)
      }

      dispatchTaskProcessingEvent()

      processNextTask(newOffscreenCanvasImageBytes)
    }
  }
}

let processNextTask: FnDefType<Uint8Array>

export function taskGluer ({ initialImageBytes, updateOffscreenCanvasImageBytes, offscreenCanvas }: TaskGluer) {
  processNextTask = doJob(updateOffscreenCanvasImageBytes, offscreenCanvas)

  return (action: ReducerAction, fn?: Modifier) => {
    queue.enqueue([action, fn])
    processNextTask(initialImageBytes)
  }
}
