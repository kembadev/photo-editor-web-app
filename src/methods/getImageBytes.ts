interface GetImageBytesProps {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number
}

export type GetImageBytesReturn = Uint8Array | 'RangeError' | undefined

export function getImageBytes ({ ctx, canvasWidth, canvasHeight }: GetImageBytesProps): GetImageBytesReturn {
  try {
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    return new Uint8Array(imageData.data.buffer)
  } catch (err) {
    if (err instanceof RangeError) return 'RangeError'
  }
}
