import { EVENTS } from '../consts.ts'

export function dispatchWarning (msg: string) {
  const warningEvent = new CustomEvent(EVENTS.WARNING, { detail: msg })
  window.dispatchEvent(warningEvent)
}
