interface ModifiedCanvasProps {
  imageBytes: Uint8Array;
  canvasWidth: number;
  canvasHeight: number
}

type Modifier = (
  manipulableCanvas: OffscreenCanvas,
  manipulableCtx: OffscreenCanvasRenderingContext2D
) => void

export function getCanvas (
  { imageBytes, canvasWidth, canvasHeight }: ModifiedCanvasProps,
  modifier?: Modifier
) {
  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')!

  const imageData = ctx.createImageData(canvasWidth, canvasHeight)
  imageData.data.set(imageBytes)
  ctx.putImageData(imageData, 0, 0)

  const manipulableCanvas = new OffscreenCanvas(canvasWidth, canvasHeight)
  const manipulableCtx = manipulableCanvas.getContext('2d')!

  if (modifier) modifier(manipulableCanvas, manipulableCtx)

  manipulableCtx.drawImage(canvas, 0, 0)

  return { canvas: manipulableCanvas, ctx: manipulableCtx }
}
