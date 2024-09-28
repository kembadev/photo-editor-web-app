import { getScaledCanvas } from '../methods/getScaledImage.ts'
import { getImageDataFromContext } from '../methods/getImageData.ts'

export interface Message {
  imageData: ImageData;
  scaling: number;
  MIMEType: string
}

onmessage = async (e: MessageEvent<Message>) => {
  const { imageData, scaling, MIMEType } = e.data

  const { canvas, ctx } = getScaledCanvas(imageData, scaling)

  const scaledImageData = getImageDataFromContext({
    ctx,
    width: canvas.width,
    height: canvas.height
  })

  if (!(scaledImageData instanceof ImageData)) {
    if (scaledImageData === undefined) {
      return postMessage('Something went wrong while downloading. Try again.')
    }

    if (scaledImageData.name === 'ImageMemoryError') {
      return postMessage('The image exceed the memory limit. Reduce the scale.')
    }

    if (scaledImageData.name === 'ImageSecurityError') {
      return postMessage('The image cannot be download due to security reasons.')
    }

    postMessage('Unexpected error.')
    return
  }

  canvas.convertToBlob({ type: MIMEType, quality: 1 })
    .then(blob => postMessage(blob))
    .catch(e => {
      if (!(e instanceof Error)) {
        return postMessage('Something went wrong while downloading. Try again.')
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
