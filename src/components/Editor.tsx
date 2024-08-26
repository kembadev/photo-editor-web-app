import './Editor.css'

import { useEffect, useRef } from 'react'
import { useTools } from '../hooks/useTools.ts'
import { useLoading } from '../hooks/useLoading.ts'
import { useImageFile } from '../hooks/useImageFile.ts'
import { useLoadEditor } from '../hooks/useLoadEditor.ts'

import { UICanvas } from './UICanvas.tsx'
import { ControlPanel } from './ControlPanel.tsx'
import Loading from './Loading.tsx'

export default function Editor () {
  const { isLoading, updateIsLoading } = useLoading({ initialState: true })

  const {
    currentToolSelected,
    toggleTool
  } = useTools()

  const { providedImgFile } = useImageFile()
  const { onLoadEditor } = useLoadEditor()

  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (!providedImgFile || !isInitialLoad.current) return

    isInitialLoad.current = false
    onLoadEditor(updateIsLoading)
  }, [providedImgFile, onLoadEditor, updateIsLoading])

  return (
    <>
      {isLoading && <Loading />}
      <main
        className='editor'
        style={{
          visibility: isLoading ? 'hidden' : 'visible'
        }}
      >
        <UICanvas
          currentToolSelected={currentToolSelected}
          toggleTool={toggleTool}
        />
        <ControlPanel currentToolSelected={currentToolSelected} />
      </main>
    </>
  )
}
