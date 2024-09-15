import { type EventListener } from '../types/types.ts'
import { type Warning } from '../hooks/Screen/useWarning.ts'

import { EVENTS } from '../consts.ts'

import { dispatchWarning } from './dispatchWarning.ts'

describe('dispatchWarning method', () => {
  it('should received the correct warning', () => {
    const warning: Warning = { color: 'green', message: 'warning' }

    const onWarning = (e: CustomEvent<Warning>) => {
      expect(e.detail).toEqual(warning)
    }

    window.addEventListener(EVENTS.WARNING, onWarning as EventListener)

    dispatchWarning(warning)
  })
})
