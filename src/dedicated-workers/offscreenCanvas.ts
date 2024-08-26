import { getUpdatedImageBytes, type ReducerAction } from '../reducer-like/ImageBytes.ts'

interface Message {
  latestImageBytes: Uint8Array;
  action: ReducerAction
}

onmessage = (e: MessageEvent<Message>) => {
  const { latestImageBytes, action } = e.data

  getUpdatedImageBytes(latestImageBytes, action)
    .then(newOffscreenCanvasImageBytes => {
      const buffer = (newOffscreenCanvasImageBytes as Uint8Array).buffer
      postMessage(buffer, [buffer])
    })
}
