import { type DIRECTION } from '../consts.ts'

import { NetworkError } from '../error-handling/NetworkError.ts'

import { lazyLoading, suspenseLoading } from '../utils/LazyLoading.ts'
import { getNetworkConnectionStatus } from '../utils/NetworkStatus.ts'

export const initialImageBytes = new Uint8Array()

export enum IMAGE_BYTES_ACTION_TYPES {
  // RESET: 'RESET',
  INVERT = 'INVERT',
  ROTATE = 'ROTATE'
  // CROP: 'CROP'
}

export type PayloadInvert = { canvasWidth: number }
export type PayloadRotate = {
  canvasWidth: number,
  canvasHeight: number,
  direction: DIRECTION
}

export type ReducerAction = { type: IMAGE_BYTES_ACTION_TYPES.INVERT, payload: PayloadInvert } |
  { type: IMAGE_BYTES_ACTION_TYPES.ROTATE, payload: PayloadRotate }

type GetUpdatedImageBytes = (state: Uint8Array, action: ReducerAction) => Promise<Uint8Array>

const lazyGetInvertedImageBytes = lazyLoading(async () => {
  const { getInvertedImageBytes } = await import('../methods/getInvertedImageBytes.ts')
  return getInvertedImageBytes
})

const lazyGetRotatedImageBytes = lazyLoading(async () => {
  const { getRotatedImageBytes } = await import('../methods/getRotatedImageBytes.ts')
  return getRotatedImageBytes
})

const imageBytes: GetUpdatedImageBytes = async (state, action) => {
  const { type } = action

  if (type === IMAGE_BYTES_ACTION_TYPES.INVERT) {
    const getInvertedImageBytes = await suspenseLoading(lazyGetInvertedImageBytes)
    return getInvertedImageBytes({ imageBytes: state, canvasWidth: action.payload.canvasWidth })
  }

  if (type === IMAGE_BYTES_ACTION_TYPES.ROTATE) {
    const { canvasWidth, canvasHeight, direction } = action.payload

    const getRotatedImageBytes = await suspenseLoading(lazyGetRotatedImageBytes)
    return getRotatedImageBytes({ imageBytes: state, canvasWidth, canvasHeight, direction })
  }

  return state
}

export async function getUpdatedImageBytes (
  state: Uint8Array,
  action: ReducerAction
): Promise<Uint8Array | Error | void> {
  try {
    return await imageBytes(state, action)
  } catch (err) {
    const networkConnectionStatus = await getNetworkConnectionStatus()

    if (!networkConnectionStatus) return new NetworkError('Network connection error. Reload the page.')

    if (err instanceof Error) return err
  }
}
