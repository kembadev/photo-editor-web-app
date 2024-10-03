import './Editor.css'

import { useEffect, useRef } from 'react'
import { useTools } from '../../hooks/Editor/useTools.ts'
import { useLoading } from '../../common/hooks/useLoading.ts'
import { useImageFile } from '../../common/hooks/useImageFile.ts'
import { useLoadEditor } from '../../hooks/Editor/useLoadEditor.ts'

import { ToolSelector } from '../ToolSelector/ToolSelector.tsx'
import { UICanvas } from '../UICanvas/UICanvas.tsx'
import { ControlPanel } from '../ControlPanel/ControlPanel.tsx'

export default function Editor () {
  const { isLoading, updateIsLoading } = useLoading({ initialState: true })

  const {
    currentToolSelected,
    toggleTool
  } = useTools()

  const { providedImgFile } = useImageFile()
  const { onEditorLoad } = useLoadEditor()

  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (!providedImgFile || !isInitialLoad.current) return

    isInitialLoad.current = false
    onEditorLoad(updateIsLoading)
  }, [providedImgFile, onEditorLoad, updateIsLoading])

  return (
    <main className={isLoading ? 'editor hidden' : 'editor'}>
      <ToolSelector
        currentToolSelected={currentToolSelected}
        toggleTool={toggleTool}
      />
      <section className='editor__interactivity-section'>
        <UICanvas currentToolSelected={currentToolSelected} />
        <ControlPanel currentToolSelected={currentToolSelected} />
      </section>
    </main>
  )
}
