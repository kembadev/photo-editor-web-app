import { type Message, type ListOfImageWithFilters } from '../../dedicated-workers/filters-preview.ts'

import { useCallback, useContext } from 'react'
import { FiltersContext } from '../../context/Filters/FiltersProvider.tsx'

import { ContextProviderNotFound } from '../../error-handling/ContextProviderNotFound.ts'

import FiltersPreview from '../../dedicated-workers/filters-preview.ts?worker'

export function useFilters () {
  const context = useContext(FiltersContext)

  if (context === undefined) {
    throw new ContextProviderNotFound('useFilters must be used within a FiltersProvider.')
  }

  const { filtersPreview, setFiltersPreview } = context

  const updateFiltersPreview = useCallback((imageData: ImageData | null) => {
    if (!imageData) {
      setFiltersPreview(null)
      return
    }

    const worker = new FiltersPreview({ name: 'FILTERS_PREVIEW_WORKER' })

    const message: Message = { imageData }
    worker.postMessage(message)

    worker.onmessage = (e: MessageEvent<ListOfImageWithFilters>) => {
      const newFiltersPreview = e.data.map(({ filterName, blob }) => ({
        filterName,
        imgSrc: blob ? URL.createObjectURL(blob) : ''
      }))

      setFiltersPreview(newFiltersPreview)
      worker.terminate()
    }

    worker.onerror = () => {
      worker.terminate()
    }
  }, [setFiltersPreview])

  return { filtersPreview, updateFiltersPreview }
}
