import { type FnDefType } from '../types/types.ts'

import { createContext, MutableRefObject } from 'react'

export type OffscreenCanvasType = OffscreenCanvas | null

export type OffscreenCanvasContext2DType = OffscreenCanvasRenderingContext2D | null

export interface OffscreenCanvasContextValue {
  offscreenCanvas: MutableRefObject<OffscreenCanvasType>;
  offscreenCanvasContext2D: MutableRefObject<OffscreenCanvasContext2DType>;
  offscreenCanvasImageBytes: Uint8Array;
  setOffscreenCanvasImageBytes: FnDefType<Uint8Array>
}

export const OffscreenCanvasContext = createContext<OffscreenCanvasContextValue | undefined>(undefined)
