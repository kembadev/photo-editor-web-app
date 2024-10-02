import './ToolsList.css'

import { tools, AVAILABLE_TOOLS } from './tools.tsx'

import { EVENTS } from '../../consts.ts'

interface ToolsListProps {
  currentToolSelected: AVAILABLE_TOOLS
}

export function ToolsList ({ currentToolSelected }: ToolsListProps) {
  const dispatchToggleTool = (desiredTool: AVAILABLE_TOOLS) => {
    const toggleToolEvent = new CustomEvent(EVENTS.TOGGLE_TOOL, { detail: desiredTool })
    window.dispatchEvent(toggleToolEvent)
  }

  return (
    <ul className='tools-list'>
      {
        tools.map(({ tool, name }) => (
          <li key={tool}>
            <button
              onClick={() => { dispatchToggleTool(tool) }}
              style={{
                backgroundColor: tool === currentToolSelected ? 'var(--btnBackground)' : 'transparent',
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
