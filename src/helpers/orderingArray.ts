interface PixelMatrix {
  imageBytes: Uint8Array;
  offset?: number
}

interface Base {
  imageBytes: Uint8Array;
  offset?: number
}

interface MatrixWidth extends Base {
  canvasWidth: number;
  canvasHeight?: null
}

interface MatrixHeight extends Base {
  canvasWidth?: null;
  canvasHeight: number
}

type MatrixNested = MatrixWidth | MatrixHeight

export function getPixelMatrixFromImageBytes ({ imageBytes, offset = 4 }: PixelMatrix) {
  const pixelMatrix: number[][] = []

  for (let i = 0; i < imageBytes.length; i += offset) {
    pixelMatrix.push([...imageBytes.slice(i, i + offset)])
  }

  return pixelMatrix
}

export function getNestedArrayFromImageBytes ({ imageBytes, canvasWidth = null, canvasHeight = null, offset = 4 }: MatrixNested) {
  const nestedArray: number[][][] = []

  const $canvasWidth = canvasWidth ?? (imageBytes.byteLength / 4) / canvasHeight!

  for (let y = 0; y < imageBytes.length; y += ($canvasWidth * offset)) {
    const rowOfValues = [...imageBytes.slice(y, y + $canvasWidth * offset)]

    const rowOfPixels = []
    for (let x = 0; x < rowOfValues.length; x += offset) {
      rowOfPixels.push(rowOfValues.slice(x, x + offset))
    }

    nestedArray.push(rowOfPixels)
  }

  return nestedArray
}
