import './ControlPanel.css'

import { tools, type AVAILABLE_TOOLS } from '../Tools/tools.tsx'

import { RESTORE } from '../../consts.ts'

import { ReactNode, useCallback, useMemo } from 'react'
import { useControls } from '../../hooks/ControlPanel/useControls.ts'
import { useLogs } from '../../common/hooks/useLogs.ts'

import { UndoIcon, RedoIcon } from '../../common/components/Icons.tsx'

interface ControlPanelProps {
  currentToolSelected: AVAILABLE_TOOLS
}

export function ControlPanel ({ currentToolSelected }: ControlPanelProps) {
  const { restoreCanvas } = useControls()
  const { UILogs } = useLogs()

  const undo = useCallback(() => {
    restoreCanvas(RESTORE.UNDO)
  }, [restoreCanvas])

  const redo = useCallback(() => {
    restoreCanvas(RESTORE.REDO)
  }, [restoreCanvas])

  const ToolFeatures: () => ReactNode = useMemo(() => {
    return tools.find(
      ({ tool }) => tool === currentToolSelected
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
    <header className='editor__control-panel'>
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
    </header>
  )
}
