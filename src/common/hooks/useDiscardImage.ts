import { useCallback } from 'react'
import { useControls } from '../../hooks/ControlPanel/useControls.ts'
import { useImageFile } from './useImageFile.ts'
import { useLogs } from './useLogs.ts'

export function useDiscardImage () {
  const { clearCanvas } = useControls()
  const { setProvidedImgFile } = useImageFile()
  const { clearLogs } = useLogs()

  const discardImage = useCallback(() => {
    clearCanvas()
    setProvidedImgFile(null)
    clearLogs()
  }, [clearCanvas, setProvidedImgFile, clearLogs])

  return { discardImage }
}
