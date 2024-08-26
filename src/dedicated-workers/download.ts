interface Message {
  offscreen: OffscreenCanvas;
  buffer: ArrayBufferLike;
  MIMEType: string
}

onmessage = async (e: MessageEvent<Message>) => {
  const { offscreen, buffer, MIMEType } = e.data

  const { width, height } = offscreen
  const imageBytes = new Uint8Array(buffer)

  const ctx = offscreen.getContext('2d')!
  const imageData = ctx.createImageData(width, height)
  imageData.data.set(imageBytes)
  ctx.putImageData(imageData, 0, 0)

  const blob = await offscreen.convertToBlob({ type: MIMEType, quality: 1 })

  postMessage(blob)
}
