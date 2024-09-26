import { createContext, Dispatch, MutableRefObject, SetStateAction } from 'react'

export type OffscreenCanvasRef = OffscreenCanvas | null
export type OffscreenCanvasContext2DRef = OffscreenCanvasRenderingContext2D | null
export type OffscreenCanvasImageDataState = ImageData | null

export interface OffscreenCanvasContextValue {
  offscreenCanvas: MutableRefObject<OffscreenCanvasRef>;
  offscreenCanvasContext2D: MutableRefObject<OffscreenCanvasContext2DRef>;
  offscreenCanvasImageData: OffscreenCanvasImageDataState;
  setOffscreenCanvasImageData: Dispatch<SetStateAction<OffscreenCanvasImageDataState>>
}

export const OffscreenCanvasContext = createContext<OffscreenCanvasContextValue | undefined>(undefined)
