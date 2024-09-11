import { type FnDefType } from '../types/types.ts'
import { type ReducerAction, type CanvasDimensions, IMAGE_BYTES_ACTION_TYPES } from '../reducer-like/ImageBytes.ts'
import { type Log } from '../context/Editor/LogsProvider.tsx'
import { type Message } from '../dedicated-workers/offscreenCanvas.ts'

import { EVENTS } from '../consts.ts'
import { IS_DEVELOPMENT } from '../config.ts'

import { TaskQueue } from '../utils/TaskQueue.ts'

import OffscreenCanvasWorker from '../dedicated-workers/offscreenCanvas.ts?worker'

type QueuedCallback = () => Promise<void>

interface EnqueueTaskProps {
  action: ReducerAction,
  getCanvasDimensions: () => CanvasDimensions,
  queuedFn: QueuedCallback
}

const queue = new TaskQueue<EnqueueTaskProps>()

const dispatchTaskProcessingEvent = () => {
  const taskProcessingEvent = new CustomEvent(
    EVENTS.TASK_PROCESSING,
    { detail: queue.getTasksLength() }
  )
  window.dispatchEvent(taskProcessingEvent)
}

type LastImageBytesHandler = (
  latestImageBytes: Uint8Array, type: IMAGE_BYTES_ACTION_TYPES
) => Promise<Log[]> | void

function getTaskProcessor (lastImageBytesHandler: LastImageBytesHandler) {
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
  let logs: Log[]

  let itemIndex = 0

  return (prevImageBytes: Uint8Array) => {
    dispatchTaskProcessingEvent()

    if (queue.getTasksLength() === 0 || isTaskRunning) return

    const tick = performance.now()

    if (isFirstJob) {
      isFirstJob = false
      latestImageBytes = prevImageBytes
    }

    isTaskRunning = true

    const { action, getCanvasDimensions, queuedFn } = queue.dequeue()!

    if (action.type === IMAGE_BYTES_ACTION_TYPES.RESTORE) {
      const { indexOfDesiredLog } = action.payload
      const { compressedImageBytes: offscreenCompressedImageBytes } = logs[indexOfDesiredLog].data

      action.payload.compressedImageBytes = offscreenCompressedImageBytes
    }

    const message: Message = {
      latestImageBytes,
      action,
      canvasDimensions: getCanvasDimensions()
    }

    worker.postMessage(message)

    worker.onmessage = async (e: MessageEvent<ArrayBufferLike>) => {
      const newOffscreenCanvasImageBytes = new Uint8Array(e.data)

      // function for last effects, e.g. to change the offscreenCanvas dimensions
      await queuedFn()

      // to use the received image bytes, e.g. setOffscreenImageBytes(newImageBytes)
      // and get the updated offscreenLogs
      logs = await lastImageBytesHandler(newOffscreenCanvasImageBytes, action.type) || logs

      isTaskRunning = false
      latestImageBytes = newOffscreenCanvasImageBytes

      if (IS_DEVELOPMENT) {
        if (itemIndex % 5 === 0 && itemIndex !== 0) console.clear()

        const { type } = action
        const tock = performance.now()

        console.info(`
          Task number ${++itemIndex}. Action type: ${type}.
          ${'payload' in action && JSON.stringify({ payload: action.payload }, null, 2).slice(0, 60)}
          Processing time: ${tock - tick}ms.
          Bytelength of new offscreenCanvasImageBytes: ${newOffscreenCanvasImageBytes.byteLength}.
        `)
      }

      dispatchTaskProcessingEvent()

      processNextTask(newOffscreenCanvasImageBytes)
    }
  }
}

export type EnqueueTask = (task: EnqueueTaskProps) => void

type GetTaskGluerProps = {
  initialImageBytes: Uint8Array;
  lastImageBytesHandler: LastImageBytesHandler
}

type GetTaskGluer = (props: GetTaskGluerProps) => EnqueueTask

let processNextTask: FnDefType<Uint8Array>

export const getTaskGluer: GetTaskGluer = ({ initialImageBytes, lastImageBytesHandler }) => {
  processNextTask = getTaskProcessor(lastImageBytesHandler)

  return (task) => {
    queue.enqueue(task)
    processNextTask(initialImageBytes)
  }
}
