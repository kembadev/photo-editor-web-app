import { type FnDefType } from '../../types/types.ts'
import { type RESTORE, type DIRECTION, type FILTERS } from '../../consts.ts'
import { type InitialCharge } from '../../hooks/ControlPanel/useActionMiddleware.ts'
import { type cropPayload } from '../../reducer-like/ImageBytes.ts'

import { createContext } from 'react'

export interface ControlsContextValue {
  setInitialCharge: FnDefType<InitialCharge>;
  clearCanvas: FnDefType;
  restoreCanvas: (restoreType: RESTORE) => void;
  invertCanvas: FnDefType;
  rotateCanvas: (direction: DIRECTION) => void;
  cropCanvas: (proportions: cropPayload) => void;
  applyFilter: (filter: FILTERS) => void
}

export const ControlsContext = createContext<ControlsContextValue | undefined>(undefined)
