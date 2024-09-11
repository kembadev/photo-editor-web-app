import './Loading.css'

interface LoadingProps {
  color?: string
}

export default function Loading ({ color = '#eee' }: LoadingProps) {
  return (
    <div
      className='spinner-loading'
      style={{
        border: `5px solid ${color}`,
        borderLeftColor: 'transparent'
      }}
    />
  )
}
