import { LogsContext, type LogData, type Log, type SetLogs } from '../../context/Editor/LogsProvider.tsx'

import { RESTORE } from '../../consts.ts'

import { useCallback, useContext } from 'react'
import { useUICanvas } from '../../hooks/Canvas/useUICanvas.ts'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'

import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'
import { getCompressedImageBytes } from '../../lib/compress.ts'

interface DataProperties {
  imageBytes: Uint8Array;
  canvasWidth: number;
  canvasHeight: number
}

type GetUpdatedLogs = (logsInfo: { prevLogs: Log[]; data: LogData }) => Log[]

interface RestoreProps {
  indexOfDesiredLog: number;
  setLogs: SetLogs,
  canvas: HTMLCanvasElement | OffscreenCanvas
}

export function useLogs () {
  const context = useContext(LogsContext)

  if (context === undefined) {
    throw new ContextProviderNotFound('useLogs must be used within a LogsProvider.')
  }

  const {
    UILogs,
    setUILogs,
    offscreenLogs,
    setOffscreenLogs
  } = context

  const { UICanvas } = useUICanvas()
  const { offscreenCanvas } = useOffscreenCanvas()

  const clearLogs = useCallback(() => {
    setUILogs([])
    setOffscreenLogs([])
  }, [setUILogs, setOffscreenLogs])

  const compressImageBytes = useCallback(async (imageBytes: Uint8Array) => {
    let compressedImageBytes

    try {
      compressedImageBytes = await getCompressedImageBytes(imageBytes)
    } catch {
      compressedImageBytes = imageBytes
    }

    return compressedImageBytes
  }, [])

  const getUpdatedLogs: GetUpdatedLogs = useCallback(({ prevLogs, data }) => {
    const indexOfLastLog = prevLogs.length - 1
    const indexOfCurrentLogSelected = prevLogs.findIndex(
      ({ isCurrentState }) => isCurrentState
    )

    // add log normally
    if (indexOfCurrentLogSelected === indexOfLastLog) {
      const updatedLogs = prevLogs.map(log => ({ ...log, isCurrentState: false }))

      return [...updatedLogs, { data, isCurrentState: true }]
    }

    // performed some action while on a previous log
    // logs must be clipped until the current one selected
    // and add a new log, corresponding to the action processed right now
    const updatedLogs = prevLogs.slice(0, indexOfCurrentLogSelected + 1).map(
      log => ({ ...log, isCurrentState: false })
    )

    return [...updatedLogs, { data, isCurrentState: true }]
  }, [])

  const addUILog = useCallback(async (dataProperties: DataProperties) => {
    const { imageBytes, canvasWidth, canvasHeight } = dataProperties
    const data = {
      compressedImageBytes: await compressImageBytes(imageBytes),
      canvasWidth,
      canvasHeight
    }

    // correction for double set state because by strict mode
    let updatedLogsCorrection: Log[]
    setUILogs(prevLogs => {
      if (updatedLogsCorrection) return updatedLogsCorrection

      const updatedLogs = getUpdatedLogs({ prevLogs, data })

      updatedLogsCorrection = updatedLogs

      return updatedLogs
    })
  }, [setUILogs, compressImageBytes, getUpdatedLogs])

  const addOffscreenLog = useCallback(async (dataProperties: DataProperties) => {
    const { imageBytes, canvasWidth, canvasHeight } = dataProperties
    const data = {
      compressedImageBytes: await compressImageBytes(imageBytes),
      canvasWidth,
      canvasHeight
    }

    let updatedLogsCorrection: Log[]
    return new Promise<Log[]>(resolve => {
      setOffscreenLogs(prevLogs => {
        if (updatedLogsCorrection) return updatedLogsCorrection

        const updatedLogs = getUpdatedLogs({ prevLogs, data })

        updatedLogsCorrection = updatedLogs

        resolve(updatedLogs)

        return updatedLogs
      })
    })
  }, [setOffscreenLogs, compressImageBytes, getUpdatedLogs])

  const getIndexOfDesiredLog = useCallback((restoreType: RESTORE) => {
    const resolveWithTheDesiredIndex = (
      prevLogs: Log[], resolve: (value: number | null) => void
    ) => {
      if (prevLogs.length <= 1) return resolve(null)

      const indexOfCurrentLogSelected = prevLogs.findIndex(
        ({ isCurrentState }) => isCurrentState
      )

      if (restoreType === RESTORE.UNDO) {
        const prevIndex = indexOfCurrentLogSelected === 0
          ? null
          : indexOfCurrentLogSelected - 1

        resolve(prevIndex)
        return
      }

      const indexOfLastLog = prevLogs.length - 1

      const posteriorIndex = indexOfCurrentLogSelected === indexOfLastLog
        ? null
        : indexOfCurrentLogSelected + 1

      resolve(posteriorIndex)
    }

    return new Promise<number | null>(resolve => {
      setUILogs(prevLogs => {
        resolveWithTheDesiredIndex(prevLogs, resolve)
        return prevLogs
      })
    })
  }, [setUILogs])

  const getUILog = useCallback((indexOfDesiredLog: number) => {
    return new Promise<Log>(resolve => {
      setUILogs(prevLogs => {
        resolve(prevLogs[indexOfDesiredLog])
        return prevLogs
      })
    })
  }, [setUILogs])

  const restore = useCallback((
    { indexOfDesiredLog, setLogs, canvas }: RestoreProps
  ) => {
    setLogs(prevLogs => {
      const indexOfLastLog = prevLogs.length - 1

      if (indexOfDesiredLog < 0 || indexOfDesiredLog > indexOfLastLog) return prevLogs

      const { canvasWidth, canvasHeight } = prevLogs[indexOfDesiredLog].data

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      const updatedLogs = prevLogs.map(log => ({ ...log, isCurrentState: false }))
      updatedLogs[indexOfDesiredLog].isCurrentState = true

      return updatedLogs
    })
  }, [])

  const restoreUI = useCallback((indexOfDesiredLog: number) => {
    restore({
      indexOfDesiredLog,
      setLogs: setUILogs,
      canvas: UICanvas.current!
    })
  }, [UICanvas, setUILogs, restore])

  const restoreOffscreen = useCallback((indexOfDesiredLog: number) => {
    restore({
      indexOfDesiredLog,
      setLogs: setOffscreenLogs,
      canvas: offscreenCanvas.current!
    })
  }, [offscreenCanvas, setOffscreenLogs, restore])

  return {
    clearLogs,
    UILogs,
    offscreenLogs,
    addUILog,
    addOffscreenLog,
    getIndexOfDesiredLog,
    getUILog,
    restoreUI,
    restoreOffscreen
  }
}
