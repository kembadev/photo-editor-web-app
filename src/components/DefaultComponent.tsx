import { useEffect, useState } from 'react'

const DogOnFireMeme = fetch('/Dog-on-fire-meme.webp')

export default function DefaultComponent ({ msg }: { msg: string }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    DogOnFireMeme
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob))
      .then(url => setSrc(url))
      .catch(err => console.error(err))
  }, [])

  return (
    <>
      <h1>{ msg }</h1>
      <img src={src} alt='dog-on-fire-meme' />
    </>
  )
}
