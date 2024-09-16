import './DownloadModal.css'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useProcessesChecker } from '../../common/hooks/useProcessesChecker.ts'

import { FormSettings } from './FormSettings.tsx'
import { Progress } from './Progress.tsx'

export interface DownloadModalHandle {
  showModal: () => void
}

const DownloadModal = forwardRef<DownloadModalHandle>((_, ref) => {
  const { taskRunningChecker } = useProcessesChecker()

  const modalRef = useRef<HTMLDialogElement>(null)

  useImperativeHandle(ref, () => ({
    showModal: () => modalRef.current?.showModal()
  }))

  const closeDownloadModal = () => modalRef.current?.close()

  return (
    <dialog
      className='download-modal'
      ref={modalRef}
      aria-modal='true'
      id='download-modal'
    >
      {
        taskRunningChecker.isQueueClear
          ? <FormSettings closeDownloadModal={closeDownloadModal} />
          : <Progress closeDownloadModal={closeDownloadModal} />
      }
    </dialog>
  )
})

export default DownloadModal
