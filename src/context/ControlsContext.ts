import { type FnDefType } from '../types/types.ts'
import { type DIRECTION } from '../consts.ts'
import { type TaskRunningChecker, type InitialCharge } from '../hooks/useActionMiddleware.ts'

import { createContext } from 'react'

export interface ControlsContextType {
  setInitialCharge: FnDefType<InitialCharge>;
  clearCanvas: FnDefType;
  taskRunningChecker: TaskRunningChecker,
  invertCanvas: FnDefType;
  rotateCanvas: (direction: DIRECTION) => void
}

export const ControlsContext = createContext<ControlsContextType | undefined>(undefined)
