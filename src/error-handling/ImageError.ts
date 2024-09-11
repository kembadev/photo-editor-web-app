import { Formatting } from '../utils/Formatting.ts'

export class ImageError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'ImageError'
  }
}

export class ImageFormatError extends ImageError {
  constructor (message: string) {
    super(message)
    this.name = 'ImageFormatError'
  }

  public static throwInvalidEncoding (invalidationMessage: string, acceptedEncodingList: string[]) {
    throw new ImageFormatError(`
      ${invalidationMessage}. Accepted encoding formats: ${
        Formatting.collapseList({ list: acceptedEncodingList })
      }
    `)
  }
}

export class ImageMemoryError extends ImageError {
  constructor (message: string) {
    super(message)
    this.name = 'ImageMemoryError'
  }
}
