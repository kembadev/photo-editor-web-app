import { useEffect, useState } from 'react'

let DogOnFireMeme: null | Response

;(async () => {
  try {
    DogOnFireMeme = await fetch('/Dog-on-fire-meme.webp')
  } catch {
    DogOnFireMeme = null
  }
})()

export default function DefaultView ({ msg }: { msg: string }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    if (!DogOnFireMeme) return

    DogOnFireMeme.blob()
      .then(blob => URL.createObjectURL(blob))
      .then(url => setSrc(url))
      .catch(err => console.error(err))
  }, [])

  return (
    <>
      <h1>{msg}</h1>
      <img src={src} alt='dog-on-fire-meme' />
    </>
  )
}
