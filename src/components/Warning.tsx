import './Warning.css'

export function Warning ({ message }: { message: string }) {
  return (
    <div
      className='warning'
      aria-live='assertive'
      role='alert'
    >
      <span>
        {message}
      </span>
    </div>
  )
}
