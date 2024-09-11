import { type Warning } from '../hooks/Screen/useWarning.ts'

import { EVENTS } from '../consts.ts'

type DispatchWarningProps = string | Warning

export function dispatchWarning (msg: DispatchWarningProps) {
  const detail: Warning = typeof msg === 'string'
    ? { message: msg, color: 'red' }
    : { message: msg.message, color: msg.color }

  const warningEvent = new CustomEvent(EVENTS.WARNING, { detail })
  window.dispatchEvent(warningEvent)
}
