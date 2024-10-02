import { ReactNode } from 'react'

import { Crop } from './Crop/Crop.tsx'
import { Filters } from './Filters/Filters.tsx'

export enum AVAILABLE_TOOLS {
  CROP = 'CROP',
  FILTERS = 'FILTERS',
  MARKUP = 'MARKUP'
}

interface Tool {
  tool: AVAILABLE_TOOLS;
  name: string;
  Component: () => ReactNode
}

export const tools: Tool[] = [
  {
    tool: AVAILABLE_TOOLS.CROP,
    name: 'Crop',
    Component: Crop
  },
  {
    tool: AVAILABLE_TOOLS.FILTERS,
    name: 'Filters',
    Component: Filters
  },
  {
    tool: AVAILABLE_TOOLS.MARKUP,
    name: 'Markup',
    Component: () => <button>Text</button>
  }
]
