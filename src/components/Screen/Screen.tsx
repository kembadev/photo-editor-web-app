import './Screen.css'

import { getInternetConnectionStatus } from '../../common/helpers/NetworkStatus.ts'

import { lazy, Suspense } from 'react'
import { useImageFile } from '../../common/hooks/useImageFile.ts'
import { useWarning } from '../../hooks/Screen/useWarning.ts'
import OffscreenCanvasProvider from '../../context/Canvas/OffscreenCanvasProvider.tsx'
import UICanvasProvider from '../../context/Canvas/UICanvasProvider.tsx'
import LogsProvider from '../../context/Editor/LogsProvider.tsx'
import ControlsProvider from '../../context/ControlPanel/ControlsProvider.tsx'

import { UploadImage } from '../Upload/UploadImage.tsx'
import DefaultView from '../../common/components/DefaultView.tsx'
import { Warning } from './Warning.tsx'
import Loading from '../../common/components/Loading.tsx'

const LazyEditor = lazy(() => (
  import('../Editor/Editor.tsx')
    .catch(async () => {
      const ok = await getInternetConnectionStatus()

      if (!ok) {
        return ({
          default: () => (
            <DefaultView msg='Network connection error. Reload the page.' />
          )
        })
      }

      return ({
        default: () => (
            <DefaultView msg='Something went wrong. Try again later.' />
        )
      })
    })
))

export function Screen () {
  const { providedImgFile } = useImageFile()
  const { warning } = useWarning()

  return (
    <>
      {warning && <Warning message={warning.message} color={warning.color} />}
      {
        providedImgFile
          ? (
              <Suspense fallback={<Loading />}>
                <LogsProvider>
                  <OffscreenCanvasProvider>
                    <UICanvasProvider>
                      <ControlsProvider>
                        <LazyEditor />
                      </ControlsProvider>
                    </UICanvasProvider>
                  </OffscreenCanvasProvider>
                </LogsProvider>
              </Suspense>
            )
          : <UploadImage />
      }
    </>
  )
}
