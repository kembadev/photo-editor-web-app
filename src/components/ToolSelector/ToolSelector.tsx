import './ToolSelector.css'

import { EVENTS } from '../../consts.ts'

import { useCallback } from 'react'
import { tools, AVAILABLE_TOOLS } from '../Tools/tools.tsx'

import { BarsArrowDown } from '../../common/components/Icons.tsx'

interface ToolSelectorProps {
  currentToolSelected: AVAILABLE_TOOLS;
  toggleTool: (desiredTool: AVAILABLE_TOOLS) => void
}

export function ToolSelector ({ currentToolSelected, toggleTool }: ToolSelectorProps) {
  const onToggleTool = useCallback((desiredTool: AVAILABLE_TOOLS) => {
    if (desiredTool === currentToolSelected) return

    const onToggleToolEvent = new CustomEvent(EVENTS.TOGGLE_TOOL, { detail: desiredTool })
    window.dispatchEvent(onToggleToolEvent)

    toggleTool(desiredTool)
  }, [currentToolSelected, toggleTool])

  return (
    <aside className='editor__tool-selector'>
      <button className='tool-selector--display-btn' title='Open tool selector'>
        <label>
          <BarsArrowDown />
          <input type='checkbox' defaultChecked hidden />
        </label>
      </button>
      <ul className='tool-selector__list'>
        {
          tools.map(({ tool, name }) => (
            <li key={tool} className='tool-selector__list--tool'>
              <button
                style={{
                  backgroundColor: tool === currentToolSelected ? 'var(--btnBackground)' : 'transparent'
                }}
                onClick={() => onToggleTool(tool)}
              >
                {name}
              </button>
            </li>
          ))
        }
      </ul>
    </aside>
  )
}
