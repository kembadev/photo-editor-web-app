import { type FILTERS } from '../../consts.ts'

import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react'

type FilterPreview = {
  filterName: FILTERS;
  imgSrc: string
}

type FiltersPreviewState = FilterPreview[] | null

interface FiltersContextValue {
  filtersPreview: FiltersPreviewState;
  setFiltersPreview: Dispatch<SetStateAction<FiltersPreviewState>>
}

export const FiltersContext = createContext<FiltersContextValue | undefined>(undefined)

export default function FiltersProvider ({ children }: {children: ReactNode}) {
  const [filtersPreview, setFiltersPreview] = useState<FiltersPreviewState>(null)

  return (
    <FiltersContext.Provider value={{ filtersPreview, setFiltersPreview }}>
      {children}
    </FiltersContext.Provider>
  )
}
