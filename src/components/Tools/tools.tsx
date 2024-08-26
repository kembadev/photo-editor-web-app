import { Crop } from './Crop/Crop.tsx'

export const AVAILABLE_TOOLS = [
  {
    name: 'Crop',
    Component: Crop
  },
  {
    name: 'Filters',
    Component: () => <button>Sepia</button>
  },
  {
    name: 'Markup',
    Component: () => <button>Texto</button>
  }
] as const

export type AvailableToolsNames = typeof AVAILABLE_TOOLS[number]['name']

export const initialTool: AvailableToolsNames = 'Crop'
