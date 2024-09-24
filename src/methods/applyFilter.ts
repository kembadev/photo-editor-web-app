import { FILTERS } from '../consts.ts'

import Filters from '../lib/filters.ts'

type ApplyFilterByFilterType = Record<FILTERS, (imageData: ImageData) => ImageData>

const APPLY_FILTER_BY_FILTER_TYPE: ApplyFilterByFilterType = {
  [FILTERS.ENRICH]: (imageData) => Filters.enrich(imageData),
  [FILTERS.GRAY_SCALE]: (imageData) => Filters.grayScale(imageData),
  [FILTERS.SEPIA]: (imageData) => Filters.sepia(imageData),
  [FILTERS.SOLARIZE]: (imageData) => Filters.solarize(imageData),
  [FILTERS.EMBOSS]: (imageData) => Filters.emboss(imageData),
  [FILTERS.EDGE]: (imageData) => Filters.edge(imageData),
  [FILTERS.POSTERIZE]: (imageData) => Filters.posterize(imageData, 4),
  [FILTERS.SHARPEN]: (ImageData) => Filters.sharpen(ImageData, 3),
  [FILTERS.STACK_BLUR]: (imageData) => Filters.stackBlur(imageData, 3)
}

interface ApplyFilterProps {
  filter: FILTERS;
  imageData: ImageData;
}

export function applyFilter ({ filter, imageData }: ApplyFilterProps) {
  const updateImageData = APPLY_FILTER_BY_FILTER_TYPE[filter]

  return updateImageData ? updateImageData(imageData) : imageData
}
