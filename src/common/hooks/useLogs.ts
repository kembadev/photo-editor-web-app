import { LogsContext, type LogData, type Log } from '../../context/Editor/LogsProvider.tsx'

import { RESTORE } from '../../consts.ts'

import { useCallback, useContext } from 'react'

import { getCompressedImageBytes } from '../../lib/compress.ts'
import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'

type AddLog = (
  logsInfo: { prevLogs: Log[]; imageData: ImageData }
) => Promise<Log[]>

interface RestoreProps {
  prevLogs: Log[];
  newIndexOfCurrentState: number
}

export function useLogs () {
  const context = useContext(LogsContext)

  if (context === undefined) {
    throw new ContextProviderNotFound('useLogs must be used within a LogsProvider.')
  }

  const { UILogs, setUILogs } = context

  const clearUILogs = useCallback(() => {
    setUILogs([])
  }, [setUILogs])

  const addLog: AddLog = useCallback(async ({ prevLogs, imageData }) => {
    const indexOfLastLog = prevLogs.length - 1
    const indexOfCurrentLogSelected = prevLogs.findIndex(
      ({ isCurrentState }) => isCurrentState
    )

    const { width, height, data } = imageData

    const compressedImageBytes = await getCompressedImageBytes(new Uint8Array(data.buffer))
    const logData: LogData = {
      width,
      height,
      compressedImageBytes
    }

    // add log normally
    if (indexOfCurrentLogSelected === indexOfLastLog) {
      const updatedLogs = prevLogs.map(
        log => ({ ...log, isCurrentState: false })
      )

      return [...updatedLogs, { data: logData, isCurrentState: true }]
    }

    // performed some action while on a previous log
    // logs must be clipped until the current one selected
    // and add a new log, corresponding to the action processed right now
    const updatedLogs = prevLogs.slice(0, indexOfCurrentLogSelected + 1).map(
      log => ({ ...log, isCurrentState: false })
    )

    return [...updatedLogs, { data: logData, isCurrentState: true }]
  }, [])

  const addUILog = useCallback(async (imageData: ImageData) => {
    const updatedLogs = await addLog({ prevLogs: UILogs, imageData })

    setUILogs(updatedLogs)
  }, [setUILogs, UILogs, addLog])

  const restoreLogs = useCallback((
    { prevLogs, newIndexOfCurrentState }: RestoreProps
  ) => {
    const indexOfLastLog = prevLogs.length - 1

    if (newIndexOfCurrentState < 0 || newIndexOfCurrentState > indexOfLastLog) {
      return prevLogs
    }

    const updatedLogs = prevLogs.map(log => ({ ...log, isCurrentState: false }))
    updatedLogs[newIndexOfCurrentState].isCurrentState = true

    return updatedLogs
  }, [])

  const restoreUILogs = useCallback((newIndexOfCurrentState: number) => {
    const restoredLogs = restoreLogs({
      prevLogs: UILogs,
      newIndexOfCurrentState
    })

    setUILogs(restoredLogs)
  }, [UILogs, setUILogs, restoreLogs])

  const getIndexOfLogOnRestore = useCallback((restoreType: RESTORE) => {
    if (UILogs.length <= 1) return null

    const indexOfCurrentLogSelected = UILogs.findIndex(
      ({ isCurrentState }) => isCurrentState
    )

    if (restoreType === RESTORE.UNDO) {
      const prevIndex = indexOfCurrentLogSelected === 0
        ? null
        : indexOfCurrentLogSelected - 1

      return prevIndex
    }

    const indexOfLastLog = UILogs.length - 1

    const posteriorIndex = indexOfCurrentLogSelected === indexOfLastLog
      ? null
      : indexOfCurrentLogSelected + 1

    return posteriorIndex
  }, [UILogs])

  return {
    clearUILogs,
    addLog,
    restoreLogs,
    UILogs,
    addUILog,
    restoreUILogs,
    getIndexOfLogOnRestore
  }
}
