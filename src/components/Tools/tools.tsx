import { Crop } from './Crop/Crop.tsx'
import { Filters } from './Filters/Filters.tsx'

export const AVAILABLE_TOOLS = [
  {
    name: 'Crop',
    Component: Crop
  },
  {
    name: 'Filters',
    Component: Filters
  },
  {
    name: 'Markup',
    Component: () => <button>Text</button>
  }
] as const

export type AvailableToolsNames = typeof AVAILABLE_TOOLS[number]['name']

export const initialTool: AvailableToolsNames = 'Crop'
