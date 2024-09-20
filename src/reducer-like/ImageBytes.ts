import { type DIRECTION } from '../consts.ts'

import { getClippedImageBytes } from '../methods/getClippedImageBytes.ts'
import { getScalingImageBytes } from '../methods/getScaledImage.ts'

import { lazyLoading, suspenseLoading } from '../common/helpers/LazyLoading.ts'
import { getDecompressedImageBytes } from '../lib/compress.ts'

export const initialImageBytes = new Uint8Array()

export enum IMAGE_BYTES_ACTION_TYPES {
  // RESET = 'RESET',
  RESTORE = 'RESTORE',
  INVERT = 'INVERT',
  ROTATE = 'ROTATE',
  CROP = 'CROP'
}

export interface CanvasDimensions {
  canvasWidth: number;
  canvasHeight: number
}

type ActionRestore = {
  type: IMAGE_BYTES_ACTION_TYPES.RESTORE,
  payload: {
    compressedImageBytes: Uint8Array,
    indexOfDesiredLog: number
  }
}

type ActionRotate = {
  type: IMAGE_BYTES_ACTION_TYPES.ROTATE;
  payload: { direction: DIRECTION }
}

type ActionInvert = { type: IMAGE_BYTES_ACTION_TYPES.INVERT }

export interface cropPayload {
  proportionOfSX: number;
  proportionOfSY: number;
  proportionOfWidth: number;
  proportionOfHeight: number;
  scaling?: number
}

type ActionCrop = {
  type: IMAGE_BYTES_ACTION_TYPES.CROP,
  payload: cropPayload
}

export type ReducerAction = ActionRestore | ActionRotate | ActionInvert | ActionCrop

interface GetUpdatedImageBytesProps {
  state: Uint8Array;
  action: ReducerAction;
  canvasDimensions: CanvasDimensions
}
type GetUpdatedImageBytes = (
  { state, action, canvasDimensions }: GetUpdatedImageBytesProps
) => Promise<Uint8Array>

const lazyGetInvertedImageBytes = lazyLoading(async () => {
  const { getInvertedImageBytes } = await import('../methods/getInvertedImageBytes.ts')
  return getInvertedImageBytes
})

const lazyGetRotatedImageBytes = lazyLoading(async () => {
  const { getRotatedImageBytes } = await import('../methods/getRotatedImageBytes.ts')
  return getRotatedImageBytes
})

const imageBytes: GetUpdatedImageBytes = async ({ state, action, canvasDimensions }) => {
  const { type } = action
  const { canvasWidth, canvasHeight } = canvasDimensions

  if (type === IMAGE_BYTES_ACTION_TYPES.RESTORE) {
    return getDecompressedImageBytes(action.payload.compressedImageBytes)
  }

  if (type === IMAGE_BYTES_ACTION_TYPES.INVERT) {
    const getInvertedImageBytes = await suspenseLoading(lazyGetInvertedImageBytes)
    return getInvertedImageBytes({ imageBytes: state, canvasWidth })
  }

  if (type === IMAGE_BYTES_ACTION_TYPES.ROTATE) {
    const { direction } = action.payload

    const getRotatedImageBytes = await suspenseLoading(lazyGetRotatedImageBytes)
    return getRotatedImageBytes({ imageBytes: state, canvasWidth, canvasHeight, direction })
  }

  if (type === IMAGE_BYTES_ACTION_TYPES.CROP) {
    const { proportionOfSX, proportionOfSY, proportionOfWidth, proportionOfHeight, scaling } = action.payload

    const finalWidth = proportionOfWidth * canvasWidth
    const finalHeight = proportionOfHeight * canvasHeight

    const clippedImageBytes = getClippedImageBytes({
      imageBytesToCut: state,
      widthOfImgToCut: canvasWidth,
      heightOfImgToCut: canvasHeight,
      requirements: {
        finalWidth,
        finalHeight,
        fromCorner: {
          sx: proportionOfSX * canvasWidth,
          sy: proportionOfSY * canvasHeight
        }
      }
    })

    if (scaling === undefined) {
      return clippedImageBytes
    }

    const { scalingImageBytes } = getScalingImageBytes({
      imageBytes: clippedImageBytes,
      canvasWidth: finalWidth,
      canvasHeight: finalHeight,
      scaling
    })

    return scalingImageBytes as Uint8Array
  }

  return state
}

export async function getUpdatedImageBytes (
  { state, action, canvasDimensions }: GetUpdatedImageBytesProps
): Promise<Uint8Array | Error> {
  try {
    return await imageBytes({ state, action, canvasDimensions })
  } catch (err) {
    return err as Error
  }
}
