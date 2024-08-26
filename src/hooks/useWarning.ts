import { type EventListener } from '../types/types.ts'

import { EVENTS } from '../consts.ts'

import { useCallback, useEffect, useState } from 'react'

export function useWarning () {
  const [warning, setWarning] = useState<string | null>(null)

  const makeWarning = useCallback((e: CustomEvent<string>) => {
    setWarning(e.detail)

    setTimeout(() => {
      setWarning(null)
    }, 5000)
  }, [])

  useEffect(() => {
    window.addEventListener(EVENTS.WARNING, makeWarning as EventListener)

    return () => {
      window.removeEventListener(EVENTS.WARNING, makeWarning as EventListener)
    }
  }, [makeWarning])

  return { warning }
}
