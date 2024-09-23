type SimpleFilter = (imageData: ImageData) => ImageData

interface ImageFilters {
  GrayScale: SimpleFilter;
  Sepia: SimpleFilter;
  Solarize: SimpleFilter;
  Emboss: SimpleFilter;
  Enrich: SimpleFilter;
  Edge: SimpleFilter;
  Twril: (imageData: ImageData, centerX: number, centerY: number, radius: number, angle: number, edge: 1 | 2, smooth: boolean) => ImageData;
  StackBlur: (imageData: ImageData, factor: number) => ImageData;
  Posterize: (imageData: ImageData, levels: number) => ImageData;
  Sharpen: (imageData: ImageData, factor: number) => ImageData;
}

declare module 'canvas-filters' {
  declare const ImageFilters: ImageFilters

  export default ImageFilters
}
