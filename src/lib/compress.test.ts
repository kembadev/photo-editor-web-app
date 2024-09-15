import { getCompressedImageBytes, getDecompressedImageBytes } from './compress.ts'

const observationImageBytes = new Uint8Array(Array(1000).fill(1))
const compressedImageBytes = await getCompressedImageBytes(observationImageBytes)

describe('Compress and decompressed methods', async () => {
  it('should shorten the image bytes', () => {
    expect(compressedImageBytes.byteLength).toBeLessThan(observationImageBytes.byteLength)
  })

  it('should make the image bytes longer', async () => {
    const decompressedImageBytes = await getDecompressedImageBytes(compressedImageBytes)
    expect(decompressedImageBytes.byteLength).toBeGreaterThan(compressedImageBytes.byteLength)
  })

  it('should throw', async () => {
    await expect(getDecompressedImageBytes(observationImageBytes)).rejects.toThrow('Received image bytes are not compressed')
  })
})
