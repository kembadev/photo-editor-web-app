import { type EventListener } from '../types/types.ts'
import { type WarningColor } from '../components/Warning.tsx'

import { EVENTS } from '../consts.ts'

import { useCallback, useEffect, useState } from 'react'

export interface Warning {
  message: string;
  color: WarningColor
}

export function useWarning () {
  const [warning, setWarning] = useState<Warning | null>(null)

  const makeWarning = useCallback((e: CustomEvent<Warning>) => {
    setWarning(e.detail)

    setTimeout(() => {
      setWarning(null)
    }, 5000)
  }, [])

  const internetRecovery = useCallback(() => {
    setWarning({
      message: 'Back online.',
      color: 'green'
    })

    setTimeout(() => {
      setWarning(null)
    }, 5000)
  }, [])

  useEffect(() => {
    window.addEventListener(EVENTS.WARNING, makeWarning as EventListener)
    window.addEventListener(EVENTS.INTERNET_RECOVERY, internetRecovery)

    return () => {
      window.removeEventListener(EVENTS.WARNING, makeWarning as EventListener)
      window.removeEventListener(EVENTS.INTERNET_RECOVERY, internetRecovery)
    }
  }, [makeWarning, internetRecovery])

  return { warning }
}
