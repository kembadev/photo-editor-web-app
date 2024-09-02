import './Loading.css'

import { CSSProperties } from 'react'

interface LoadingProps {
  color?: string
}

interface CustomCSSProperties extends CSSProperties {
  '--color'?: string;
}

export default function Loading ({ color = '#eee' }: LoadingProps) {
  return (
    <div
      className='spinner-loading'
      style={{
        '--color': color
      } as CustomCSSProperties}
    />
  )
}
