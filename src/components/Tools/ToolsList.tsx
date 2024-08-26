import { type AvailableToolsNames, AVAILABLE_TOOLS } from './tools.tsx'

import { EVENTS } from '../../consts.ts'

interface ToolsListProps {
  currentToolSelected: AvailableToolsNames
}

export function ToolsList ({ currentToolSelected }: ToolsListProps) {
  const dispatchToggleTool = (name: AvailableToolsNames) => {
    const toggleToolEvent = new CustomEvent(EVENTS.TOGGLE_TOOL, { detail: name })
    window.dispatchEvent(toggleToolEvent)
  }

  return (
    <ul>
      {
        AVAILABLE_TOOLS.map(({ name }) => (
          <li key={name}>
            <button
              onClick={() => { dispatchToggleTool(name) }}
              style={{
                backgroundColor: name === currentToolSelected ? 'var(--btnBackground)' : 'transparent',
                borderRadius: '15px'
              }}
            >
              {name}
            </button>
          </li>
        ))
      }
    </ul>
  )
}
