import './Progress.css'

import { CSSProperties, useEffect, useMemo, useRef } from 'react'
import { useProcessesChecker } from '../../common/hooks/useProcessesChecker.ts'

interface ProgressBarProps {
  closeDownloadModal: () => void
}

interface CustomCSSProperties extends CSSProperties {
  '--progress'?: string;
}

export function Progress ({ closeDownloadModal }: ProgressBarProps) {
  const { taskRunningChecker } = useProcessesChecker()

  const maxNumberOfProcessesRunning = useRef(0)

  useEffect(() => {
    const { processesRunning } = taskRunningChecker

    if (maxNumberOfProcessesRunning.current < processesRunning) {
      maxNumberOfProcessesRunning.current = processesRunning
    }
  }, [taskRunningChecker])

  const progress = useMemo(() => {
    const max = maxNumberOfProcessesRunning.current
    const { processesRunning } = taskRunningChecker

    const quotient = processesRunning / max

    if (isNaN(quotient)) return 0.5

    const difference = 1 - quotient

    if (quotient === Infinity || difference < 0) return 0

    return difference
  }, [taskRunningChecker, maxNumberOfProcessesRunning])

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
