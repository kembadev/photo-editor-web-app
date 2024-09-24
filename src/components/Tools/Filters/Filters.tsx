import './Filter.css'

import { FILTERS } from '../../../consts.ts'

import { useControls } from '../../../hooks/ControlPanel/useControls.ts'

const filters: { filter: FILTERS; name: string }[] = [
  { filter: FILTERS.SEPIA, name: 'Sepia' },
  { filter: FILTERS.GRAY_SCALE, name: 'Gray scale' },
  { filter: FILTERS.ENRICH, name: 'Enrich' },
  { filter: FILTERS.SOLARIZE, name: 'Solarize' },
  { filter: FILTERS.EDGE, name: 'Edge' },
  { filter: FILTERS.EMBOSS, name: 'Emboss' },
  { filter: FILTERS.POSTERIZE, name: 'Posterize' },
  { filter: FILTERS.SHARPEN, name: 'Sharpen' },
  { filter: FILTERS.STACK_BLUR, name: 'Blur' }
]

export function Filters () {
  const { applyFilter } = useControls()

  return (
    <ul className='image-filters'>
      {
        filters.map(({ filter, name }) => (
          <li key={filter} className='image-filters__item'>
            <button
              key={filter}
              onClick={() => applyFilter(filter)}
            >
              {name}
            </button>
          </li>
        ))
      }
    </ul>
  )
}
