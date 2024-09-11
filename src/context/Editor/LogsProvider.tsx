import { createContext, ReactNode, useState, Dispatch, SetStateAction } from 'react'

export interface LogData {
  compressedImageBytes: Uint8Array;
  canvasWidth: number;
  canvasHeight: number
}

export interface Log {
  isCurrentState: boolean;
  data: LogData
}

export type SetLogs = Dispatch<SetStateAction<Log[]>>

interface LogsContextType {
  UILogs: Log[];
  setUILogs: SetLogs;
  offscreenLogs: Log[];
  setOffscreenLogs: SetLogs
}

export const LogsContext = createContext<LogsContextType | undefined>(undefined)

export default function LogsProvider ({ children }: { children: ReactNode }) {
  const [UILogs, setUILogs] = useState<Log[]>([])
  const [offscreenLogs, setOffscreenLogs] = useState<Log[]>([])

  const value = {
    UILogs,
    setUILogs,
    offscreenLogs,
    setOffscreenLogs
  }

  return (
    <LogsContext.Provider
      value={value}
    >
      {children}
    </LogsContext.Provider>
  )
}
