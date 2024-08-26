import { CANVAS_ACCEPTED_MIME_TYPES } from '../consts.ts'

import { ImageError } from '../error-handling/ImageError.ts'

const regExpDataURI = (mimeType: string) => new RegExp(`^data:${mimeType};base64,`, 'i')

export function dataURI2Blob (dataURI: string): Blob {
  const isMIMETypeInvalid = !CANVAS_ACCEPTED_MIME_TYPES.some(
    mimeType => regExpDataURI(mimeType).test(dataURI)
  )

  if (isMIMETypeInvalid) {
    ImageError.ThrowInvalidEncoding(
      CANVAS_ACCEPTED_MIME_TYPES.map(type => type),
      'Invalid either DataURI string or DataURI MIMEType'
    )
  }

  const ASCIIstring = atob(dataURI.split(',')[1])
  const mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0]

  const arrayBuffer = new ArrayBuffer(ASCIIstring.length)
  const uint8Array = new Uint8Array(arrayBuffer)

  for (let i = 0; i < ASCIIstring.length; i++) {
    uint8Array[i] = ASCIIstring.charCodeAt(i)
  }

  const blob = new Blob([uint8Array], { type: mimeType })

  return blob
}
