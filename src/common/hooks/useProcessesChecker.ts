import { type EventListener } from '../../types/types.ts'

import { EVENTS } from '../../consts.ts'

import { useCallback, useEffect, useState } from 'react'

interface TaskRunningChecker {
  isQueueClear: boolean;
  processesRunning: number
}

export function useProcessesChecker () {
  const [taskRunningChecker, setTaskRunningChecker] = useState<TaskRunningChecker>({
    isQueueClear: true,
    processesRunning: 0
  })

  const onTaskRunning = useCallback((e: CustomEvent<number>) => {
    const processesRunning = e.detail

    setTaskRunningChecker({
      isQueueClear: processesRunning === 0,
      processesRunning
    })
  }, [])

  useEffect(() => {
    window.addEventListener(EVENTS.TASK_PROCESSING, onTaskRunning as EventListener)

    return () => {
      window.removeEventListener(EVENTS.TASK_PROCESSING, onTaskRunning as EventListener)
    }
  }, [onTaskRunning])

  return { taskRunningChecker }
}
