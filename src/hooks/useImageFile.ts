import { ImageFileContext } from '../context/ImageFile.tsx'

import { useContext } from 'react'

import { TypeValidation } from '../error-handling/TypeValidation.ts'

export function useImageFile () {
  const context = useContext(ImageFileContext)

  if (context === undefined) {
    throw new TypeValidation('useImageFile must be used within a ImageFileProvider.')
  }

  return context
}
