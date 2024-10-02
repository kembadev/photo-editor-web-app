import { AVAILABLE_TOOLS } from '../../components/Tools/tools.tsx'

import { useState } from 'react'

export function useTools () {
  const [currentToolSelected, setCurrentToolSelected] = useState(AVAILABLE_TOOLS.CROP)

  const toggleTool = (desiredTool: AVAILABLE_TOOLS) => {
    setCurrentToolSelected(desiredTool)
  }

  return {
    currentToolSelected,
    toggleTool
  }
}
