import { imageBytes2BlobURL } from '../helpers/imageBytes2BlobURL.ts'
import { getImageBytes, type GetImageBytesReturn } from './getImageBytes.ts'

interface ImageScaler {
  imageBytes: Uint8Array;
  imgWidth: number;
  imgHeight: number
}

interface ImageScalerResponsePayload {
  scalingImageBytes: GetImageBytesReturn
}

type ScalingImageBytesResponse = (response: ImageScalerResponsePayload) => void

interface OnLoadImage {
  scaling: number;
  res: ScalingImageBytesResponse
}

export function getImageScaler ({ imageBytes, imgWidth, imgHeight }: ImageScaler) {
  const imgSrc = imageBytes2BlobURL({ imageBytes, imgWidth, imgHeight })

  let isImgElementAlreadyLoaded = false

  const imgElement = document.createElement('img')
  imgElement.src = imgSrc

  const listenerController = new AbortController()

  const clearCache = () => {
    URL.revokeObjectURL(imgSrc)
    imgElement.remove()
  }

  const onLoadImage = ({ scaling, res }: OnLoadImage) => {
    if (!isImgElementAlreadyLoaded) {
      isImgElementAlreadyLoaded = true
      listenerController.abort()
    }

    const scalingImgWidth = imgWidth * scaling
    const scalingImgHeight = imgHeight * scaling

    const offscreenCanvasMock = new OffscreenCanvas(scalingImgWidth, scalingImgHeight)
    const offscreenCanvasMockContext = offscreenCanvasMock.getContext('2d')!

    offscreenCanvasMockContext.drawImage(imgElement, 0, 0, scalingImgWidth, scalingImgHeight)

    const scalingImageBytes = getImageBytes({
      ctx: offscreenCanvasMockContext,
      canvasWidth: scalingImgWidth,
      canvasHeight: scalingImgHeight
    })

    res({ scalingImageBytes })
  }

  return {
    clearCache,
    scale: (scaling: number) => {
      return new Promise<ImageScalerResponsePayload>(resolve => {
        if (isImgElementAlreadyLoaded) return onLoadImage({ scaling, res: resolve })

        imgElement.addEventListener('load', () => {
          onLoadImage({ scaling, res: resolve })
        }, { signal: listenerController.signal })
      })
    }
  }
}
