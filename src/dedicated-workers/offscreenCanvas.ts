import { getUpdatedImageData, type ReducerAction } from '../reducer-like/ImageData.ts'
import { OFFSCREEN_CANVAS_ERROR_MESSAGES } from '../core/actionTaskQueue.ts'

export interface Message {
  latestImageData: ImageData;
  action: ReducerAction
}

onmessage = (e: MessageEvent<Message>) => {
  const { latestImageData, action } = e.data

  getUpdatedImageData(latestImageData, action)
    .then(newImageData => {
      postMessage(newImageData)
    })
    .catch(err => {
      if (err instanceof Error) {
        if (err.name === 'InternetConnectionDownException') {
          postMessage(OFFSCREEN_CANVAS_ERROR_MESSAGES.INTERNET_DOWN)
          return
        }
      }

      postMessage(OFFSCREEN_CANVAS_ERROR_MESSAGES.UNEXPECTED_ERROR)
    })
}
