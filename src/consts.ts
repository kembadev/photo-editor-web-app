import { type ListUnion } from './types/types.ts'

export const CANVAS_ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
] as const

export type CanvasAcceptedMimeTypes = ListUnion<typeof CANVAS_ACCEPTED_MIME_TYPES>

export const EVENTS = {
  EDITOR_LOADED: 'EDITOR_LOADED',
  TOGGLE_TOOL: 'TOGGLE_TOOL',
  WARNING: 'WARNING',
  TASK_PROCESSING: 'TASK_PROCESSING',
  TERMINATE_OFFSCREEN_CANVAS_WORKER: 'TERMINATE_OFFSCREEN_CANVAS_WORKER'
}

export enum DIRECTION {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT'
}

export const ZOOM_LIMITS = {
  MIN: 1,
  MAX: 2
}
