import './ControlPanel.css'

import { type AvailableToolsNames, AVAILABLE_TOOLS } from './Tools/tools.tsx'

import { ReactNode, useMemo, useRef } from 'react'
import { useDiscardImage } from '../hooks/useDiscardImage.ts'

import { UndoIcon, RedoIcon } from './Icons.tsx'
import { ToolsList } from './Tools/ToolsList.tsx'
import DownloadModal, { DownloadModalHandle } from './DownloadModal/DownloadModal.tsx'

interface ControlPanelProps {
  currentToolSelected: AvailableToolsNames
}

export function ControlPanel ({ currentToolSelected }: ControlPanelProps) {
  const { discardImage } = useDiscardImage()

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
          onClick={discardImage}
        >
          Discard
        </button>
      </section>
      <DownloadModal ref={modalRef} />
    </header>
  )
}
