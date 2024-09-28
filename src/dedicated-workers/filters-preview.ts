import { FILTERS } from '../consts.ts'

import { applyFilter } from '../methods/applyFilter.ts'
import { getCanvas } from '../common/helpers/getCanvas.ts'

import { createSpecialDocumentForWorker } from '../common/helpers/documentOnWorkerContext.ts'

export interface Message {
  imageData: ImageData
}

type ImageWithFilter = { filterName: FILTERS; blob: Blob | null }
export type ListOfImageWithFilters = ImageWithFilter[]

self.onmessage = async (e: MessageEvent<Message>) => {
  createSpecialDocumentForWorker()

  const { imageData } = e.data

  const listOfImageWithFilters: ListOfImageWithFilters = []

  for (const filter of Object.values(FILTERS)) {
    const updatedImageData = applyFilter({ filter, imageData })

    const { canvas } = getCanvas(updatedImageData)
    const blobPromise = canvas.convertToBlob({ type: 'image/webp', quality: 0.5 })

    const imageWithFilter = await new Promise<ImageWithFilter>(resolve => {
      blobPromise
        .then(blob => {
          resolve({ filterName: filter, blob })
        })
        .catch(() => {
          resolve({ filterName: filter, blob: null })
        })
    })

    listOfImageWithFilters.push(imageWithFilter)
  }

  postMessage(listOfImageWithFilters)
}
