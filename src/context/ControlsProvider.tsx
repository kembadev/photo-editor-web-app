import { ReactNode } from 'react'

import { ControlsContext } from './ControlsContext.ts'

import { useAction } from '../hooks/useAction.ts'

export default function ControlsProvider ({ children }: { children: ReactNode }) {
  const {
    setInitialCharge,
    clearCanvas,
    taskRunningChecker,
    invertCanvas,
    rotateCanvas
  } = useAction()

  const contextValue = {
    setInitialCharge,
    clearCanvas,
    taskRunningChecker,
    invertCanvas,
    rotateCanvas
  }

  return (
    <ControlsContext.Provider
      value={contextValue}
    >
      {children}
    </ControlsContext.Provider>
  )
}
