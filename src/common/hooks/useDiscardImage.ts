import { useCallback } from 'react'
import { useControls } from '../../hooks/ControlPanel/useControls.ts'
import { useImageFile } from './useImageFile.ts'
import { useLogs } from './useLogs.ts'
import { useFilters } from '../../hooks/Editor/useFilters.ts'

export function useDiscardImage () {
  const { clearCanvas } = useControls()
  const { setProvidedImgFile } = useImageFile()
  const { clearUILogs } = useLogs()
  const { updateFiltersPreview } = useFilters()

  const discardImage = useCallback(() => {
    clearCanvas()
    setProvidedImgFile(null)
    clearUILogs()
    updateFiltersPreview(null)
  }, [clearCanvas, setProvidedImgFile, clearUILogs, updateFiltersPreview])

  return { discardImage }
}
