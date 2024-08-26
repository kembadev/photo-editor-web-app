import { useContext } from 'react'
import { ControlsContext } from '../context/ControlsContext.ts'

import { TypeValidation } from '../error-handling/TypeValidation.ts'

export function useProcessesChecker () {
  const context = useContext(ControlsContext)

  if (context === undefined) {
    throw new TypeValidation('useControls must be used within a ControlsProvider.')
  }

  const { taskRunningChecker } = context

  return { taskRunningChecker }
}
