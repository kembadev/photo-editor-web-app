import { getScaledCanvas } from '../methods/getScaledImage.ts'

export interface Message {
  imageData: ImageData;
  scaling: number;
  MIMEType: string
}

onmessage = async (e: MessageEvent<Message>) => {
  const { imageData, scaling, MIMEType } = e.data

  const { canvas } = getScaledCanvas(imageData, scaling)

  canvas.convertToBlob({ type: MIMEType, quality: 1 })
    .then(blob => postMessage(blob))
    .catch(e => {
      if (!(e instanceof Error)) {
        return postMessage('Something went wrong while downloading.')
      }

      if (e.name === 'IndexSizeError') {
        return postMessage('The image is too large to download or one of the dimensions is zero.')
      }

      if (e.name === 'SecurityError') {
        return postMessage('The image cannot be download due to security reasons.')
      }

      postMessage('The image was not able to be downloaded.')
    })
}
