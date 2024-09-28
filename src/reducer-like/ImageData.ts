import { type DIRECTION, type FILTERS } from '../consts.ts'
import { type LogData } from '../context/Editor/LogsProvider.tsx'

import { getClippedImageData } from '../methods/getClippedImageData.ts'

import { lazyLoading, suspenseLoading } from '../common/helpers/LazyLoading.ts'
import { getDecompressedImageBytes } from '../lib/compress.ts'

import { createSpecialDocumentForWorker } from '../common/helpers/documentOnWorkerContext.ts'

export enum IMAGE_DATA_ACTION_TYPES {
  // RESET = 'RESET',
  RESTORE = 'RESTORE',
  INVERT = 'INVERT',
  ROTATE = 'ROTATE',
  CROP = 'CROP',
  FILTER = 'FILTER'
}

export interface CanvasDimensions {
  canvasWidth: number;
  canvasHeight: number
}

type ActionRestore = {
  type: IMAGE_DATA_ACTION_TYPES.RESTORE,
  payload: {
    logData: LogData,
    newIndexOfCurrentState: number
  }
}

type ActionRotate = {
  type: IMAGE_DATA_ACTION_TYPES.ROTATE;
  payload: { direction: DIRECTION }
}

type ActionInvert = { type: IMAGE_DATA_ACTION_TYPES.INVERT }

export interface cropPayload {
  proportionOfSX: number;
  proportionOfSY: number;
  proportionOfWidth: number;
  proportionOfHeight: number
}

type ActionCrop = {
  type: IMAGE_DATA_ACTION_TYPES.CROP,
  payload: cropPayload
}

type ActionFilter = {
  type: IMAGE_DATA_ACTION_TYPES.FILTER;
  payload: { filter: FILTERS }
}

export type ReducerAction = ActionRestore | ActionRotate | ActionInvert | ActionCrop | ActionFilter

const lazyGetInvertedImageData = lazyLoading(async () => {
  const { getInvertedImageData } = await import('../methods/getInvertedImageData.ts')
  return getInvertedImageData
})

const lazyGetRotatedImageBytes = lazyLoading(async () => {
  const { getRotatedImageData } = await import('../methods/getRotatedImageData.ts')
  return getRotatedImageData
})

const lazyApplyFilter = lazyLoading(async () => {
  const { applyFilter } = await import('../methods/applyFilter.ts')
  return applyFilter
})

const updateImageData = async (state: ImageData, action: ReducerAction): Promise<ImageData> => {
  const { type } = action

  if (type === IMAGE_DATA_ACTION_TYPES.RESTORE) {
    const { width, height, compressedImageBytes } = action.payload.logData

    const decompressedImageBytes = await getDecompressedImageBytes(compressedImageBytes)
    const typedArray = new Uint8ClampedArray(decompressedImageBytes.buffer)

    const imageData = new ImageData(typedArray, width, height)

    return imageData
  }

  if (type === IMAGE_DATA_ACTION_TYPES.INVERT) {
    const getInvertedImageData = await suspenseLoading(lazyGetInvertedImageData)
    return getInvertedImageData(state)
  }

  if (type === IMAGE_DATA_ACTION_TYPES.ROTATE) {
    const { direction } = action.payload

    const getRotatedImageData = await suspenseLoading(lazyGetRotatedImageBytes)
    return getRotatedImageData(state, direction)
  }

  if (type === IMAGE_DATA_ACTION_TYPES.CROP) {
    const { width, height } = state
    const { proportionOfSX, proportionOfSY, proportionOfWidth, proportionOfHeight } = action.payload

    const finalWidth = proportionOfWidth * width
    const finalHeight = proportionOfHeight * height

    const fromCorner = {
      sx: proportionOfSX * width,
      sy: proportionOfSY * height
    }

    const clippedImageData = getClippedImageData({
      imageDataToCut: state,
      requirements: { finalWidth, finalHeight, fromCorner }
    })

    return clippedImageData
  }

  if (type === IMAGE_DATA_ACTION_TYPES.FILTER) {
    createSpecialDocumentForWorker()

    const applyFilter = await suspenseLoading(lazyApplyFilter)
    const { filter } = action.payload

    const newImageData = applyFilter({ filter, imageData: state })

    return newImageData
  }

  return state
}

export async function getUpdatedImageData (state: ImageData, action: ReducerAction) {
  return new Promise<ImageData>((resolve, reject) => {
    updateImageData(state, action)
      .then(updatedImageData => resolve(updatedImageData))
      .catch(err => reject(err))
  })
}
