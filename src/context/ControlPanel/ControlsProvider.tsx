import { ReactNode } from 'react'

import { ControlsContext } from './ControlsContext.ts'

import { useAction } from '../../hooks/ControlPanel/useAction.ts'

export default function ControlsProvider ({ children }: { children: ReactNode }) {
  const contextValue = useAction()

  return (
    <ControlsContext.Provider
      value={contextValue}
    >
      {children}
    </ControlsContext.Provider>
  )
}
