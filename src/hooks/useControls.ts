import { useContext } from 'react'
import { ControlsContext } from '../context/ControlsContext.ts'

import { TypeValidation } from '../error-handling/TypeValidation.ts'

export function useControls () {
  const context = useContext(ControlsContext)

  if (context === undefined) {
    throw new TypeValidation('useControls must be used within a ControlsProvider.')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { taskRunningChecker, ...rest } = context

  return rest
}
