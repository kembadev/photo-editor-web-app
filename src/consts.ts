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
  INTERNET_RECOVERY: 'INTERNET_RECOVERY',
  ASPECT_RATIO: 'ASPECT_RATIO'
}

export enum DIRECTION {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT'
}

export const ZOOM_LIMITS = {
  MIN: 1,
  MAX: 5
}

export enum RESTORE {
  UNDO = 'UNDO',
  REDO = 'REDO'
}

export enum USABLE_CANVAS {
  UICANVAS = 'UICANVAS',
  DOWNLOADABLE_CANVAS = 'DOWNLOADABLE_CANVAS'
}

export enum FILTERS {
  GRAY_SCALE = 'GRAY_SCALE',
  SEPIA = 'SEPIA',
  ENRICH = 'ENRICH',
  SOLARIZE = 'SOLARIZE',
  EMBOSS = 'EMBOSS',
  EDGE = 'EDGE',
  STACK_BLUR = 'STACK_BLUR',
  POSTERIZE = 'POSTERIZE',
  SHARPEN = 'SHARPEN'
}
