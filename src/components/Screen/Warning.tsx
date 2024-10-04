import './Warning.css'

import { useMemo } from 'react'

export type WarningColor = 'red' | 'green' | 'yellow'

interface WarningProps {
  message: string;
  color?: WarningColor
}

export function Warning ({ message, color = 'red' }: WarningProps) {
  const styleColors = useMemo(() => {
    if (color === 'red') {
      return {
        backgroundColor: '#b53471',
        textColor: 'var(--main-text-color)'
      }
    }

    if (color === 'yellow') {
      return {
        backgroundColor: '#f6b93b',
        textColor: 'var(--btn-bg-yellow-text-color)'
      }
    }

    return {
      backgroundColor: '#01a3a4',
      textColor: 'var(--main-text-color)'
    }
  }, [color])

  return (
    <div
      className='warning'
      aria-live='assertive'
      role='alert'
      style={{
        backgroundColor: styleColors.backgroundColor,
        color: styleColors.textColor
      }}
    >
      <span>
        {message}
      </span>
    </div>
  )
}
