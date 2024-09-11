import './FormSettings.css'

import { ChangeEvent, useId, useMemo, useState } from 'react'
import { useOffscreenCanvas } from '../../hooks/Canvas/useOffscreenCanvas.ts'
import { useFilename, AVAILABLE_IMAGE_FORMATS } from '../../hooks/DownloadModal/useFilename.ts'
import { useDownloadImage } from '../../hooks/DownloadModal/useDownloadImage.ts'

import Loading from '../../common/components/Loading.tsx'
import { XIcon } from '../../common/components/Icons.tsx'

interface FormSettingsProps {
  closeDownloadModal: () => void
}

export function FormSettings ({ closeDownloadModal }: FormSettingsProps) {
  const [desiredScale, setDesiredScale] = useState(1)

  const { offscreenCanvas, offscreenCanvasImageBytes } = useOffscreenCanvas()

  const { filename, handleFilenameOnChange, filenameError, formatDefaultValue } = useFilename()
  const { handleOnSubmit, isDownloading, downloadError } = useDownloadImage()

  const filenameInputId = useId()
  const filenameRequiredId = useId()

  const handleScaleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newScale = Number(e.target.value)
    setDesiredScale(prevScale => newScale || prevScale)
  }

  const imageFinalDimensions = useMemo(() => {
    if (!offscreenCanvas.current ||
      offscreenCanvasImageBytes.length === 0) return { width: 0, height: 0 }

    const { width: offscreenCanvasWidth, height: offscreenCanvasHeight } = offscreenCanvas.current

    const width = Math.round(desiredScale * offscreenCanvasWidth)
    const height = Math.round(desiredScale * offscreenCanvasHeight)

    return { width, height }
  }, [desiredScale, offscreenCanvas, offscreenCanvasImageBytes])
  return (
    <>
      {isDownloading && <Loading color='#8dcbf2' />}
      <form
        className='download-modal__form'
        onSubmit={handleOnSubmit}
      >
        <header className='config-controls'>
          <section className='config-controls__scale'>
            <article>
              <input
                type='range'
                name='scale'
                min={0.25}
                max={4}
                value={desiredScale}
                step={0.05}
                onChange={handleScaleOnChange}
              />
              <span>{desiredScale}x</span>
            </article>
            <p>
              Resolution:&nbsp;
              <span title='Image width'>{imageFinalDimensions.width}px</span>
              &nbsp;<small>x</small>&nbsp;
              <span title='Image height'>{imageFinalDimensions.height}px</span>
            </p>
          </section>
          <section className='config-controls__image-name'>
            <label htmlFor={filenameInputId}>Image name</label>
            <div>
              <input
                type='text'
                name='name'
                id={filenameInputId}
                aria-errormessage={filenameRequiredId}
                placeholder='Filename'
                title={filename}
                value={filename}
                onChange={handleFilenameOnChange}
                autoComplete='off'
                spellCheck='false'
              />
              <select
                name='format'
                defaultValue={formatDefaultValue}
              >
                {
                  AVAILABLE_IMAGE_FORMATS.sort().map(format => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))
                }
              </select>
            </div>
            {filenameError && <em role='alert' id={filenameRequiredId}>{filenameError}</em>}
          </section>
        </header>

        <div
          className='download-discard'
          style={{
            opacity: isDownloading ? 0.3 : 1,
            pointerEvents: isDownloading ? 'none' : 'auto'
          }}
        >
          {downloadError && <strong role='alert'>{downloadError}</strong>}
          <div>
            <button type='submit'>Download</button>
            <button
              type='button'
              title='Cancel'
              aria-label='close-modal'
              onClick={closeDownloadModal}
            >
              <XIcon />
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
