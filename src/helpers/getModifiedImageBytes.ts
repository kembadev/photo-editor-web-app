interface ModifiedImageBytes {
  imageBytes: Uint8Array;
  imgWidth: number
}

export function getModifiedImageBytes (
  { imageBytes, imgWidth }: ModifiedImageBytes,
  transformRow: (rowOfPixels: number[][]) => number[][]
) {
  const modifiedImageBytes: number[][][] = []

  const offset = 4

  const rowOfLooseValuesLength = imgWidth * offset

  for (let rowIndex = 0; rowIndex < imageBytes.length; rowIndex += rowOfLooseValuesLength) {
    const rowOfLooseValues = [
      ...imageBytes.slice(rowIndex, rowIndex + rowOfLooseValuesLength)
    ]

    const rowOfPixels: number[][] = []
    for (let pixelIndex = 0; pixelIndex < rowOfLooseValuesLength; pixelIndex += offset) {
      rowOfPixels.push(rowOfLooseValues.slice(pixelIndex, pixelIndex + offset))
    }

    modifiedImageBytes.push(transformRow(rowOfPixels))
  }

  return new Uint8Array(modifiedImageBytes.flat(2))
}
