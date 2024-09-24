import './ControlPanel.css'

import { type AvailableToolsNames, AVAILABLE_TOOLS } from '../Tools/tools.tsx'

import { RESTORE } from '../../consts.ts'

import { ReactNode, useCallback, useMemo, useRef } from 'react'
import { useControls } from '../../hooks/ControlPanel/useControls.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'
import { useDiscardImage } from '../../common/hooks/useDiscardImage.ts'

import { UndoIcon, RedoIcon } from '../../common/components/Icons.tsx'
import { ToolsList } from '../Tools/ToolsList.tsx'
import DownloadModal, { DownloadModalHandle } from '../DownloadModal/DownloadModal.tsx'

interface ControlPanelProps {
  currentToolSelected: AvailableToolsNames
}

export function ControlPanel ({ currentToolSelected }: ControlPanelProps) {
  const { restoreCanvas } = useControls()
  const { UILogs } = useLogs()
  const { discardImage } = useDiscardImage()

  const modalRef = useRef<DownloadModalHandle>(null)

  const undo = useCallback(() => {
    restoreCanvas(RESTORE.UNDO)
  }, [restoreCanvas])

  const redo = useCallback(() => {
    restoreCanvas(RESTORE.REDO)
  }, [restoreCanvas])

  const openDownloadModal = () => {
    modalRef.current?.showModal()
  }

  const ToolFeatures: () => ReactNode = useMemo(() => {
    return AVAILABLE_TOOLS.find(
      ({ name }) => name === currentToolSelected
    )!.Component
  }, [currentToolSelected])

  const isPrevLogAvailable = useMemo(() => {
    const indexOfCurrentLogSelected = UILogs.findIndex(
      ({ isCurrentState }) => isCurrentState
    )

    if (UILogs.length <= 1 || indexOfCurrentLogSelected === 0) return false

    return true
  }, [UILogs])

  const isPostLogAvailable = useMemo(() => {
    const indexOfCurrentLogSelected = UILogs.findIndex(
      ({ isCurrentState }) => isCurrentState
    )

    if (UILogs.length <= 1 || indexOfCurrentLogSelected === UILogs.length - 1) return false

    return true
  }, [UILogs])

  return (
    <header className='control-panel'>
      <section className="control-panel__image-actions">
        <article className="restore-actions">
          <button
            title="Undo"
            onClick={undo}
            style={{
              backgroundColor: isPrevLogAvailable ? 'var(--btnBackground)' : 'transparent',
              cursor: isPrevLogAvailable ? 'pointer' : 'auto'
            }}
          >
            <UndoIcon />
          </button>
          <button
            title="Redo"
            onClick={redo}
            style={{
              backgroundColor: isPostLogAvailable ? 'var(--btnBackground)' : 'transparent',
              cursor: isPostLogAvailable ? 'pointer' : 'auto'
            }}
          >
            <RedoIcon />
          </button>
        </article>

        <article className="tool-features">
          <ToolFeatures />
        </article>
      </section>

      <section className='control-panel__tools-selector'>
        <ToolsList currentToolSelected={currentToolSelected} />
      </section>

      <section className='control-panel__save-discard'>
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
