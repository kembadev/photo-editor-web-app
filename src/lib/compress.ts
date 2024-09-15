import { compress, decompress } from 'fflate'

import { ImageError } from '../error-handling/ImageError.ts'

const gzipHeader = [0x1F, 0x8B, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00]

function isGzipCompressed (data: Uint8Array) {
  for (let i = 0; i < gzipHeader.length; i++) {
    if (data[i] !== gzipHeader[i]) {
      return false
    }
  }

  return true
}

export function getCompressedImageBytes (imageBytes: Uint8Array) {
  return new Promise<Uint8Array>((resolve, reject) => {
    compress(imageBytes, { level: 1, mem: 5 }, (err, compressedImageBytes) => {
      if (err !== null) return reject(err)

      const uint8ArrayGzipHeader = new Uint8Array(gzipHeader)

      const result = new Uint8Array(uint8ArrayGzipHeader.length + compressedImageBytes.length)
      result.set(uint8ArrayGzipHeader)
      result.set(compressedImageBytes, uint8ArrayGzipHeader.length)

      return resolve(result)
    })
  })
}

export function getDecompressedImageBytes (compressedImageBytes: Uint8Array) {
  return new Promise<Uint8Array>((resolve, reject) => {
    if (!isGzipCompressed(compressedImageBytes)) {
      return reject(new ImageError('Received image bytes are not compressed'))
    }

    decompress(compressedImageBytes.slice(gzipHeader.length), (err, decompressedImageBytes) => {
      if (err === null) return resolve(decompressedImageBytes)

      reject(err)
    })
  })
}
