import { EVENTS } from '../../consts.ts'

async function checkInternetStatus () {
  try {
    const headers = {
      'Cache-Control': 'no-store, no-cache',
      Expires: '0'
    }

    const res = await fetch(`/ping.txt?cacheBuster=${Date.now()}`, { cache: 'no-store', headers })

    if (res.status === 404) return true

    return res.ok
  } catch {
    return false
  }
}

let isConnectionCheckingIntervalRunning = false

export function runConnectionChecksAtIntervals () {
  isConnectionCheckingIntervalRunning = true

  const interval = setInterval(async () => {
    const isOnline = await checkInternetStatus()

    if (!isOnline) return

    clearInterval(interval)
    isConnectionCheckingIntervalRunning = false

    const warningEvent = new CustomEvent(EVENTS.INTERNET_RECOVERY)
    window.dispatchEvent(warningEvent)
  }, 3000)
}

export async function getInternetConnectionStatus () {
  const ok = await checkInternetStatus()

  if (ok) return true

  if (typeof window === 'undefined' || isConnectionCheckingIntervalRunning) return false

  runConnectionChecksAtIntervals()

  return false
}
