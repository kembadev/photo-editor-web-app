import './Crop.css'

import { DIRECTION, EVENTS } from '../../../consts.ts'

import { useCallback, useId, useState } from 'react'
import { useControls } from '../../../hooks/ControlPanel/useControls.ts'

import { RotateLeftIcon, RotateRightIcon, InvertIcon, AspectRatioIcon } from '../../../common/components/Icons.tsx'

export type AspectRatio = { aspectRatio: number | 'original'; name: string }

const aspectRatios: AspectRatio[] = [
  { aspectRatio: 'original', name: 'Original' },
  { aspectRatio: 26 / 36, name: 'Carnet (26/36)' },
  { aspectRatio: 1, name: 'Square' },
  { aspectRatio: 5 / 4, name: '5/4' },
  { aspectRatio: 4 / 3, name: '4/3' },
  { aspectRatio: 3 / 2, name: '3/2' },
  { aspectRatio: 16 / 9, name: '16/9' }
]

export function Crop () {
  const [isChecked, setIsChecked] = useState(false)

  const { invertCanvas, rotateCanvas } = useControls()

  const checkboxInput = useId()

  const rotateToLeft = () => rotateCanvas(DIRECTION.LEFT)

  const rotateToRight = () => rotateCanvas(DIRECTION.RIGHT)

  const handleOnCheckboxChange = () => {
    setIsChecked(prev => !prev)
  }

  const handleOnAspectRatioSelect = useCallback((aspectRatio: AspectRatio) => {
    setIsChecked(false)

    const aspectRatioEvent = new CustomEvent(EVENTS.ASPECT_RATIO, { detail: aspectRatio })
    window.dispatchEvent(aspectRatioEvent)
  }, [])

  return (
    <div className='crop-features'>
      <section className='crop-features__aspect-ratio'>
        <label htmlFor={checkboxInput} title='Select aspect ratio'>
          <button>
            <AspectRatioIcon />
          </button>
        </label>
        <input
          id={checkboxInput}
          type='checkbox'
          checked={isChecked}
          onChange={handleOnCheckboxChange}
          hidden
          />
        <section className='crop-features__aspect-ratio--selector'>
          <ul>
            {
              aspectRatios.map((aspectRatio, i) => (
                <li key={i} onClick={() => handleOnAspectRatioSelect(aspectRatio)}>
                  {aspectRatio.name}
                </li>
              ))
            }
          </ul>
        </section>
      </section>
      <section className="crop-features__rotate">
        <button title="Rotate to left" onClick={rotateToLeft}>
          <RotateLeftIcon />
        </button>
        <button title="Rotate to right" onClick={rotateToRight}>
          <RotateRightIcon />
        </button>
      </section>
      <section className="crop-features__invert">
        <button title="Invert image" onClick={invertCanvas}>
          <InvertIcon />
        </button>
      </section>
    </div>
  )
}
