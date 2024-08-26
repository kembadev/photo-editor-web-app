import { type FnDefType } from '../types/types.ts'

import { createContext, RefObject, MutableRefObject } from 'react'

export type UICanvasContext2DType = CanvasRenderingContext2D | null

export interface UICanvasContextValue {
  UICanvas: RefObject<HTMLCanvasElement>;
  UICanvasContainer: RefObject<HTMLDivElement>;
  UICanvasContext2D: MutableRefObject<UICanvasContext2DType>;
  UICanvasImageBytes: Uint8Array;
  setUICanvasImageBytes: FnDefType<Uint8Array>
}

export const UICanvasContext = createContext<UICanvasContextValue | undefined>(undefined)
