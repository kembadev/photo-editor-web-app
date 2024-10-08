import { CANVAS_ACCEPTED_MIME_TYPES } from '../../consts.ts'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useErrorMessage } from '../../common/hooks/useErrorMessage.ts'
import { useImageFile } from '../../common/hooks/useImageFile.ts'

export const AVAILABLE_IMAGE_FORMATS = CANVAS_ACCEPTED_MIME_TYPES.map(
  MIMEType => MIMEType.split('/')[1]
)
const jpegRegExp = /jpe?g/i

export function useFilename () {
  const [filename, setFilename] = useState('')
  const {
    errorMessage: filenameError,
    updateErrorMessage: updateFileNameError
  } = useErrorMessage()

  const { providedImgFile } = useImageFile()

  const handleFilenameOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFilename = e.target.value
    setFilename(newFilename)

    if (newFilename.length === 0) return updateFileNameError('**Filename required**')

    updateFileNameError(null)
  }

  useEffect(() => {
    if (!providedImgFile) return

    setFilename(providedImgFile.name.split('.').slice(0, -1).join(''))
  }, [providedImgFile])

  const formatDefaultValue = useMemo(() => {
    if (!providedImgFile) return ''

    const { type } = providedImgFile
    const providedImgFormat = type.split('/')[1]

    if (jpegRegExp.test(providedImgFormat)) return 'jpeg'

    return AVAILABLE_IMAGE_FORMATS.find(
      format => format === providedImgFormat
    ) ?? 'png'
  }, [providedImgFile])

  return { filename, handleFilenameOnChange, filenameError, formatDefaultValue }
}
