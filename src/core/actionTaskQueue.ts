import { type ReducerAction, IMAGE_DATA_ACTION_TYPES } from '../reducer-like/ImageData.ts'
import { type Log } from '../context/Editor/LogsProvider.tsx'
import { type Message } from '../dedicated-workers/offscreenCanvas.ts'
import { type ModifierCallback } from '../hooks/ControlPanel/useActionMiddleware.ts'

import { EVENTS, USABLE_CANVAS } from '../consts.ts'
import { IS_DEVELOPMENT } from '../config.ts'

import { TaskQueue } from '../utils/TaskQueue.ts'

import OffscreenCanvasWorker from '../dedicated-workers/offscreenCanvas.ts?worker'

interface EnqueueTaskProps {
  action: ReducerAction;
  modifierFn: ModifierCallback
}

const queue = new TaskQueue<EnqueueTaskProps>()

const dispatchTaskProcessingEvent = () => {
  const taskProcessingEvent = new CustomEvent(
    EVENTS.TASK_PROCESSING,
    { detail: queue.getTasksLength() }
  )
  window.dispatchEvent(taskProcessingEvent)
}

type StartingLogs = [Log]

interface LatestImageDataHandlerProps {
  updatedImageData: ImageData;
  action: ReducerAction;
  prevLogs: Log[]
}

type LatestImageBytesReturn = { updatedLogs: Log[] }

type LatestImageDataHandler = (
  handlerProps: LatestImageDataHandlerProps
) => Promise<LatestImageBytesReturn> | LatestImageBytesReturn

type TypedArray = Uint8Array | Uint16Array | Uint8ClampedArray | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array | BigUint64Array | BigInt64Array

function isTypedArray (value: unknown): value is TypedArray {
  return ArrayBuffer.isView(value) && !(value instanceof DataView)
}

function replaceTypedArrayRecursively (value: unknown): unknown {
  if (isTypedArray(value)) return value.constructor.name

  if (Array.isArray(value)) {
    return value.map(v => replaceTypedArrayRecursively(v))
  }

  if (value === null || typeof value !== 'object') return value

  const obj = value as Record<string, unknown>
  const newObj = { ...obj }

  for (const key in value) {
    newObj[key] = replaceTypedArrayRecursively(obj[key])
  }

  return newObj
}

function getTaskProcessor (startingLogs: StartingLogs, latestImageDataHandler: LatestImageDataHandler) {
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
  let latestImageData: ImageData
  let logs: Log[] = []

  let itemIndex = 0

  return async (imageData: ImageData) => {
    if (queue.getTasksLength() === 0 || isTaskRunning) return

    const tick = performance.now()

    isTaskRunning = true

    if (isFirstJob) {
      isFirstJob = false

      latestImageData = imageData
      logs = startingLogs
    }

    const { action, modifierFn } = queue.dequeue()!

    if (action.type === IMAGE_DATA_ACTION_TYPES.RESTORE) {
      const { newIndexOfCurrentState } = action.payload

      action.payload.logData = logs[newIndexOfCurrentState].data
    }

    const message: Message = { latestImageData, action }

    worker.postMessage(message)

    worker.onmessage = async (e: MessageEvent<ImageData>) => {
      const newImageData = e.data

      const interceptedImageData = modifierFn
        ? await modifierFn(
          newImageData,
          USABLE_CANVAS.DOWNLOADABLE_CANVAS
        ) ?? newImageData
        : newImageData

      // to use the received ImageData, e.g. setOffscreenImageData(interceptedImageData)
      // and get the updated logs
      const { updatedLogs } = await latestImageDataHandler({
        updatedImageData: interceptedImageData,
        action,
        prevLogs: logs
      })

      logs = updatedLogs

      isTaskRunning = false
      latestImageData = interceptedImageData

      if (IS_DEVELOPMENT) {
        if (itemIndex % 7 === 0 && itemIndex !== 0) console.clear()
        const tock = performance.now()

        let actionPayload

        if ('payload' in action) {
          actionPayload = action.payload === undefined
            ? undefined
            : replaceTypedArrayRecursively({ ...action.payload })
        }

        const { width, height, data } = interceptedImageData
        const newImageDataInfo = JSON.stringify({ width, height, dataByteLength: data.byteLength }, null, 2)

        console.info(`
          Task number ${++itemIndex}. Action type: ${action.type}.
          ${actionPayload ? JSON.stringify({ payload: actionPayload }, null, 2) : 'No payload'}
          Processing time: ${tock - tick}ms.
          newImageData: ${newImageDataInfo}.
        `)
      }

      dispatchTaskProcessingEvent()

      processNextTask(interceptedImageData)
    }
  }
}

export type EnqueueTask = (task: EnqueueTaskProps) => void

interface GetTaskGluerProps {
  startingImageData: ImageData;
  startingLogs: [Log];
  latestImageDataHandler: LatestImageDataHandler
}

type GetTaskGluer = (props: GetTaskGluerProps) => EnqueueTask

let processNextTask: (imageData: ImageData) => Promise<void>

export const getTaskGluer: GetTaskGluer = ({ startingImageData, startingLogs, latestImageDataHandler }) => {
  processNextTask = getTaskProcessor(startingLogs, latestImageDataHandler)

  return (task) => {
    queue.enqueue(task)
    dispatchTaskProcessingEvent()

    processNextTask(startingImageData)
  }
}
