import './ProgressBar.css'

import { CSSProperties, useEffect, useMemo, useRef } from 'react'
import { useProcessesChecker } from '../../hooks/useProcessesChecker.ts'

interface ProgressBarProps {
  closeDownloadModal: () => void
}

interface CustomCSSProperties extends CSSProperties {
  '--progress'?: string;
}

export function ProgressBar ({ closeDownloadModal }: ProgressBarProps) {
  const { taskRunningChecker } = useProcessesChecker()

  const prevProcessesRunning = useRef(0)

  useEffect(() => {
    const { processesRunning } = taskRunningChecker

    if (processesRunning > prevProcessesRunning.current) {
      prevProcessesRunning.current = processesRunning
    }
  }, [taskRunningChecker])

  const progress = useMemo(() => {
    const difference = taskRunningChecker.processesRunning / prevProcessesRunning.current

    return 1 - (difference > 1 ? 1 : difference)
  }, [taskRunningChecker, prevProcessesRunning])

  return (
    <div className='download-modal__progressive-bar'>
      <header>
        <div
          className='progressive-bar'
          style={{
            '--progress': progress + 'turn'
          } as CustomCSSProperties}
        >
          <strong>{Math.floor(progress * 100)}%</strong>
        </div>
      </header>
      <button
        className='close-modal'
        onClick={closeDownloadModal}
      >
        Close
      </button>
    </div>
  )
}
