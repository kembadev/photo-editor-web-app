import './Warning.css'

import { useMemo } from 'react'

export type WarningColor = 'red' | 'green' | 'yellow'

interface WarningProps {
  message: string;
  color?: WarningColor
}

export function Warning ({ message, color = 'red' }: WarningProps) {
  const backgroundColor: string = useMemo(() => {
    if (color === 'red') return '#b53471'

    if (color === 'yellow') return '#f6b93b'

    return '#01a3a4'
  }, [color])

  return (
    <div
      className='warning'
      aria-live='assertive'
      role='alert'
      style={{
        backgroundColor
      }}
    >
      <span>
        {message}
      </span>
    </div>
  )
}
