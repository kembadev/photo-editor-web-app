import { Formatting } from '../utils/Formatting.ts'

export class ImageError extends Error {
  readonly name: string

  constructor (msg: string) {
    super(msg)
    this.name = 'ImageError'
  }

  static ThrowInvalidEncoding (acceptedEncodingList: string[], invalidationMsg?: string): never {
    let parsedInvalidationMsg: string | undefined

    if (invalidationMsg) {
      parsedInvalidationMsg = Formatting.ParseString(invalidationMsg)
    }

    const formatted = Formatting.CollapseList({
      list: acceptedEncodingList
    })

    throw new ImageError(
      `${parsedInvalidationMsg || ''} Accepted encoding formats: ${formatted}.`
    )
  }
}
