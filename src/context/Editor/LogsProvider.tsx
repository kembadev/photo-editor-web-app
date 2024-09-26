import { createContext, ReactNode, useState, Dispatch, SetStateAction } from 'react'

export interface LogData {
  width: number;
  height: number;
  compressedImageBytes: Uint8Array
}

export interface Log {
  isCurrentState: boolean;
  data: LogData
}

interface LogsContextType {
  UILogs: Log[];
  setUILogs: Dispatch<SetStateAction<Log[]>>
}

export const LogsContext = createContext<LogsContextType | undefined>(undefined)

export default function LogsProvider ({ children }: { children: ReactNode }) {
  const [UILogs, setUILogs] = useState<Log[]>([])

  const value = {
    UILogs,
    setUILogs
  }

  return (
    <LogsContext.Provider
      value={value}
    >
      {children}
    </LogsContext.Provider>
  )
}
