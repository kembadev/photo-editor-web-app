import './Crop.css'

import { DIRECTION } from '../../../consts.ts'

import { useControls } from '../../../hooks/useControls.ts'

import { RotateLeftIcon, RotateRightIcon, InvertIcon } from '../../Icons.tsx'

export function Crop () {
  const { invertCanvas, rotateCanvas } = useControls()

  const rotateToLeft = () => rotateCanvas(DIRECTION.LEFT)

  const rotateToRight = () => rotateCanvas(DIRECTION.RIGHT)

  return (
    <>
      <div className="rotate_container">
        <button title="Rotate to left" onClick={rotateToLeft}>
          <RotateLeftIcon />
        </button>
        <button title="Rotate to right" onClick={rotateToRight}>
          <RotateRightIcon />
        </button>
      </div>
      <div className="invert_container">
        <button title="Invert image" onClick={invertCanvas}>
          <InvertIcon />
        </button>
      </div>
    </>
  )
}
