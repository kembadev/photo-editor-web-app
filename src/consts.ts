export const CANVAS_ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
] as const

export type CanvasAcceptedMimeTypes = typeof CANVAS_ACCEPTED_MIME_TYPES[number]

export const EVENTS = {
  EDITOR_LOADED: 'EDITOR_LOADED',
  TOGGLE_TOOL: 'TOGGLE_TOOL',
  WARNING: 'WARNING',
  TASK_PROCESSING: 'TASK_PROCESSING',
  TERMINATE_OFFSCREEN_CANVAS_WORKER: 'TERMINATE_OFFSCREEN_CANVAS_WORKER',
  INTERNET_RECOVERY: 'INTERNET_RECOVERY'
}

export enum DIRECTION {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT'
}

export const ZOOM_LIMITS = {
  MIN: 1,
  MAX: 5
}
