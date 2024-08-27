import './Screen.css'

import { getInternetConnectionStatus } from '../utils/NetworkStatus.ts'

import { lazy, Suspense } from 'react'
import { useImageFile } from '../hooks/useImageFile.ts'
import { useWarning } from '../hooks/useWarning.ts'

import { UploadImage } from './UploadImage.tsx'
import DefaultComponent from './DefaultComponent.tsx'
import { Warning } from './Warning.tsx'
import Loading from './Loading.tsx'

const LazyEditor = lazy(() => (
  import('./Editor.tsx')
    .catch(async () => {
      const ok = await getInternetConnectionStatus()

      if (!ok) {
        return ({
          default: () => (
            <DefaultComponent msg='Network connection error. Reload the page.' />
          )
        })
      }

      return ({
        default: () => (
            <DefaultComponent msg='Something went wrong. Try again later.' />
        )
      })
    })
))

export function Screen () {
  const { providedImgFile } = useImageFile()
  const { warning } = useWarning()

  return (
    <>
      {warning && <Warning message={warning} />}
      {
        providedImgFile
          ? (
              <Suspense fallback={<Loading />}>
                <LazyEditor />
              </Suspense>
            )
          : <UploadImage />
      }
    </>
  )
}
