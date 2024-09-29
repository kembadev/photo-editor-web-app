import './Filter.css'

import { FILTERS } from '../../../consts.ts'

import { useCallback } from 'react'
import { useControls } from '../../../hooks/ControlPanel/useControls.ts'
import { useFilters } from '../../../hooks/Editor/useFilters.ts'

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
  const { filtersPreview } = useFilters()

  const getImgSrc = useCallback((filter: FILTERS) => {
    if (!filtersPreview) return ''

    const { imgSrc } = filtersPreview.find(
      ({ filterName }) => filterName === filter
    )!

    return imgSrc
  }, [filtersPreview])

  return (
    <ul className='image-filters'>
      {
        filters.map(({ filter, name }) => (
          <li
            key={filter}
            className='image-filters__item'
            onClick={() => applyFilter(filter)}
            aria-label={`Apply ${name} filter to the image`}
            role='button'
          >
            <figure>
              <div>
                <img
                  loading='lazy'
                  src={filtersPreview ? getImgSrc(filter) : ''}
                  alt={`${name.toLowerCase().split(' ').join('_')}_image`}
                />
              </div>
              <figcaption>{name}</figcaption>
            </figure>
          </li>
        ))
      }
    </ul>
  )
}
