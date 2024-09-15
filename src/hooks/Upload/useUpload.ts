import { FormEvent, DragEvent, useRef, useState } from 'react'
import { useErrorMessage } from '../../common/hooks/useErrorMessage.ts'
import { useImageFile } from '../../common/hooks/useImageFile.ts'

import { Result } from '../../utils/Result.ts'

interface UploadImageForm {
  imageFile?: File
}

const UPLOAD_FILE_ERROR_MESSAGES = {
  UNEXPECTED_ERROR: 'Unexpected error has occurred. Try again.',
  MULTIPLE_FILES: 'Multiple files not allowed.',
  INCORRECT_TYPE: (type: string) => `File must be of type image. Received: ${type}.`,
  FILE_NOT_PROVIDED: 'Only files are supported.'
}

export function useUpload () {
  const { errorMessage, updateErrorMessage } = useErrorMessage()
  const [isOnDragOver, setIsOnDragOver] = useState(false)

  const { setProvidedImgFile } = useImageFile()

  const form = useRef<HTMLFormElement>(null)
  const inputFile = useRef<HTMLInputElement>(null)

  const handleInputOnChange = () => {
    form.current!.requestSubmit()
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement

    const formObject = Object.fromEntries(new FormData(form))
    const { imageFile }: UploadImageForm = formObject

    const {
      UNEXPECTED_ERROR,
      INCORRECT_TYPE
    } = UPLOAD_FILE_ERROR_MESSAGES

    if (imageFile === undefined) {
      return updateErrorMessage(UNEXPECTED_ERROR)
    }

    const usableImageFile: File = imageFile
    const fileType = usableImageFile.type.split('/')[0]

    let result: Result<File, string>
    if (fileType !== 'image') {
      result = Result.Failed({
        error: INCORRECT_TYPE(usableImageFile.type)
      })
    } else {
      result = Result.Successful(usableImageFile)
    }

    if (result.success) return setProvidedImgFile(result.value)

    updateErrorMessage(result.error)
  }

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsOnDragOver(false)

    const { FILE_NOT_PROVIDED, MULTIPLE_FILES } = UPLOAD_FILE_ERROR_MESSAGES

    const items = e.dataTransfer.items

    if (items.length > 1) return updateErrorMessage(MULTIPLE_FILES)

    if (items[0].kind !== 'file') {
      return updateErrorMessage(FILE_NOT_PROVIDED)
    }

    const file = items[0].getAsFile()

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file as File)
    inputFile.current!.files = dataTransfer.files

    form.current!.requestSubmit()
  }

  const handleOnDragOver = (e: DragEvent) => {
    e.preventDefault()

    if (!isOnDragOver) setIsOnDragOver(true)
  }

  const handleOnDragLeave = () => {
    setIsOnDragOver(false)
  }

  return {
    form,
    inputFile,
    errorMessage,
    isOnDragOver,
    handleInputOnChange,
    handleSubmit,
    handleOnDragOver,
    handleOnDragLeave,
    handleDrop
  }
}
