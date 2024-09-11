import { compress, decompress } from 'fflate'

export function getCompressedImageBytes (imageBytes: Uint8Array) {
  return new Promise<Uint8Array>((resolve, reject) => {
    compress(imageBytes, { level: 1, mem: 5 }, (err, compressedImageBytes) => {
      if (err === null) return resolve(compressedImageBytes)

      reject(err)
    })
  })
}

export function getDecompressedImageBytes (compressedImageBytes: Uint8Array) {
  return new Promise<Uint8Array>((resolve, reject) => {
    decompress(compressedImageBytes, (err, compressedImageBytes) => {
      if (err === null) return resolve(compressedImageBytes)

      reject(err)
    })
  })
}
