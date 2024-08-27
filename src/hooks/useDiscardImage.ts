import { useCallback } from 'react'
import { useControls } from './useControls.ts'
import { useImageFile } from './useImageFile.ts'

export function useDiscardImage () {
  const { clearCanvas } = useControls()
  const { setProvidedImgFile } = useImageFile()

  const discardImage = useCallback(() => {
    clearCanvas()
    setProvidedImgFile(null)
  }, [clearCanvas, setProvidedImgFile])

  return { discardImage }
}
