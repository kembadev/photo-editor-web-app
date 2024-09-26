type Modifier = (
  manipulableCanvas: OffscreenCanvas,
  manipulableCtx: OffscreenCanvasRenderingContext2D
) => void

export function getCanvas (
  imageData: ImageData,
  modifier?: Modifier
) {
  const { width, height } = imageData

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  ctx.putImageData(imageData, 0, 0)

  const manipulableCanvas = new OffscreenCanvas(width, height)
  const manipulableCtx = manipulableCanvas.getContext('2d')!

  if (modifier) modifier(manipulableCanvas, manipulableCtx)

  manipulableCtx.drawImage(canvas, 0, 0)

  return { canvas: manipulableCanvas, ctx: manipulableCtx }
}
