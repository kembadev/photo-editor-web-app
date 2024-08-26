import { initialTool, type AvailableToolsNames } from '../components/Tools/tools.tsx'

import { useState } from 'react'

export function useTools () {
  const [currentToolSelected, setCurrentToolSelected] = useState(initialTool)

  const toggleTool = (desiredTool: AvailableToolsNames) => {
    setCurrentToolSelected(desiredTool)
  }

  return {
    currentToolSelected,
    toggleTool
  }
}
