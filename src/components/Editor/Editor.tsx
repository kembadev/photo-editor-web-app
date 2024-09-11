import './Editor.css'

import { useEffect, useRef } from 'react'
import { useTools } from '../../hooks/Editor/useTools.ts'
import { useLoading } from '../../common/hooks/useLoading.ts'
import { useImageFile } from '../../common/hooks/useImageFile.ts'
import { useLoadEditor } from '../../hooks/Editor/useLoadEditor.ts'

import { UICanvas } from '../UICanvas/UICanvas.tsx'
import { ControlPanel } from '../ControlPanel/ControlPanel.tsx'
import Loading from '../../common/components/Loading.tsx'

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
