import { useContext } from 'react'
import { ControlsContext } from '../../context/ControlPanel/ControlsContext.ts'

import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'

export function useControls () {
  const context = useContext(ControlsContext)

  if (context === undefined) {
    throw new ContextProviderNotFound('useControls must be used within a ControlsProvider.')
  }

  return context
}
