import { ImageFileContext } from '../../context/Screen/ImageFile.tsx'

import { useContext } from 'react'

import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'

export function useImageFile () {
  const context = useContext(ImageFileContext)

  if (context === undefined) {
    throw new ContextProviderNotFound('useImageFile must be used within a ImageFileProvider.')
  }

  return context
}
