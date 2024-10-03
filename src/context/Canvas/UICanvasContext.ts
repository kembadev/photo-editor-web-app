import { createContext, RefObject, MutableRefObject, Dispatch, SetStateAction } from 'react'

export type UICanvasContext2DRef = CanvasRenderingContext2D | null
export type UICanvasImageDataState = ImageData | null

export interface UICanvasContextValue {
  UICanvas: RefObject<HTMLCanvasElement>;
  UICanvasContainer: RefObject<HTMLHeadingElement>;
  UICanvasContext2D: MutableRefObject<UICanvasContext2DRef>;
  UICanvasImageData: UICanvasImageDataState;
  setUICanvasImageData: Dispatch<SetStateAction<UICanvasImageDataState>>
}

export const UICanvasContext = createContext<UICanvasContextValue | undefined>(undefined)
