import './ControlPanel.css'

import { type AvailableToolsNames, AVAILABLE_TOOLS } from './Tools/tools.tsx'

import { ReactNode, useMemo, useRef } from 'react'
/* import { useLogs } from '../hooks/useLogs.js'
import { useImageBytes } from '../hooks/useImageBytes.js'
import { useCanvas } from '../hooks/useCanvas.js' */

import { UndoIcon, RedoIcon } from './Icons.tsx'
import { ToolsList } from './Tools/ToolsList.tsx'
import DownloadModal, { DownloadModalHandle } from './DownloadModal/DownloadModal.tsx'

interface ControlPanelProps {
  currentToolSelected: AvailableToolsNames
}

export function ControlPanel ({ currentToolSelected }: ControlPanelProps) {
  /* const { logs, addLog, changeAfterUndo } = useLogs()
  const { currentImageBytes } = useImageBytes()
  const { canvas, scaling, canvasOrientation } = useCanvas()
  const {
    handleUndo,
    handleRedo,
    clearCanvas
  } = useControls()

  const modal = useRef()

  useEffect(() => {
    if (!currentImageBytes) return

    const { width: canvasWidth, height: canvasHeight } = canvas.current
    const orientation = canvasOrientation

    const newLog = {
      scaling,
      imageBytes: currentImageBytes,
      orientation,
      canvasWidth,
      canvasHeight,
      isCurrentState: true
    }

    const currentStateLogIndex = logs.findIndex(({ isCurrentState }) => Boolean(isCurrentState))
    const currentStateLog = logs[currentStateLogIndex]
    const isCurrentImageBytesDifferentOfTheUsedLog = !currentImageBytes.every(
      (value, index) => value === currentStateLog?.imageBytes[index]
    )

    if (currentStateLogIndex !== logs.length - 1) {
      if (isCurrentImageBytesDifferentOfTheUsedLog) {
        changeAfterUndo({ currentStateLogIndex, newLog })
      }

      return
    }

    if (currentStateLogIndex === logs.length - 1 && !isCurrentImageBytesDifferentOfTheUsedLog) return

    addLog(newLog)
  }, [currentImageBytes])

  const openModal = () => {
    modal.current.showModal()
  }

  const currentStateIndex = useMemo(() => logs.findIndex(
    ({ isCurrentState }) => Boolean(isCurrentState)
  ), [logs]) */

  const modalRef = useRef<DownloadModalHandle>(null)

  const openDownloadModal = () => {
    modalRef.current?.showModal()
  }

  const ToolFeatures: () => ReactNode = useMemo(() => {
    return AVAILABLE_TOOLS.find(
      ({ name }) => name === currentToolSelected
    )!.Component
  }, [currentToolSelected])

  return (
    <header className='control-panel'>
      <section className="control-panel__image-actions">
        <article className="restore-actions_container">
          <button
            title="Undo"
            /* onClick={handleUndo}
            style={{
              backgroundColor: currentStateIndex === 0 && 'transparent',
              cursor: currentStateIndex === 0 && 'auto'
            }} */
          >
            <UndoIcon />
          </button>
          <button
            title="Redo"
            /* onClick={handleRedo}
            style={{
              backgroundColor: currentStateIndex === logs.length - 1 && 'transparent',
              cursor: currentStateIndex === logs.length - 1 && 'auto'
            }} */
          >
            <RedoIcon />
          </button>
        </article>

        <article className="tool-features_container">
          <ToolFeatures />
        </article>
      </section>

      <section className='control-panel__tools-selector'>
        <ToolsList currentToolSelected={currentToolSelected} />
      </section>

      <section className='control-panel__save-discard_cotainer'>
        <button
          className="save-btn"
          title="Save image"
          onClick={openDownloadModal}
          aria-describedby='download-modal'
        >
          Save
        </button>
        <button
          className='discard-btn'
          title='Discard image'
          /* onClick={clearCanvas} */
        >
          Discard
        </button>
      </section>
      <DownloadModal ref={modalRef} />
    </header>
  )
}
