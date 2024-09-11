import { getUpdatedImageBytes, type ReducerAction, type CanvasDimensions } from '../reducer-like/ImageBytes.ts'

export interface Message {
  latestImageBytes: Uint8Array;
  action: ReducerAction;
  canvasDimensions: CanvasDimensions
}

onmessage = (e: MessageEvent<Message>) => {
  const { latestImageBytes, action, canvasDimensions } = e.data

  getUpdatedImageBytes({ state: latestImageBytes, action, canvasDimensions })
    .then(newOffscreenCanvasImageBytes => {
      const buffer = (newOffscreenCanvasImageBytes as Uint8Array).buffer
      postMessage(buffer, [buffer])
    })
}
