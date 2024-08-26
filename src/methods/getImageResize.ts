interface ImageResize {
  originalHeight: number;
  originalWidth: number;
  containerHeight: number;
  containerWidth: number
}

export function getImageResize ({ originalHeight, originalWidth, containerHeight, containerWidth }: ImageResize) {
  const basicResize = Math.min(containerWidth / originalWidth, containerHeight / originalHeight)

  let finalImageWidth = originalWidth * basicResize
  let finalImageHeight = originalHeight * basicResize

  const isBasicHeightScalingTheLongestSide = finalImageHeight > finalImageWidth

  const imageSizeMaxLength = Math.min(containerHeight, containerWidth)

  while (finalImageWidth > imageSizeMaxLength || finalImageHeight > imageSizeMaxLength) {
    if (isBasicHeightScalingTheLongestSide) {
      finalImageHeight--
      finalImageWidth = (finalImageHeight / originalHeight) * originalWidth
    } else {
      finalImageWidth--
      finalImageHeight = (finalImageWidth / originalWidth) * originalHeight
    }
  }

  return { scaleY: finalImageHeight / originalHeight, scaleX: finalImageWidth / originalWidth }
}
