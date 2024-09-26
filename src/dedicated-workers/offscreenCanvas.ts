import { getUpdatedImageData, type ReducerAction } from '../reducer-like/ImageData.ts'

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
}
