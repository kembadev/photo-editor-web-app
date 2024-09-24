import ImageFilters from 'canvas-filters'

export default class Filters {
  static grayScale (imageData: ImageData) {
    return ImageFilters.GrayScale(imageData)
  }

  static sepia (imageData: ImageData) {
    return ImageFilters.Sepia(imageData)
  }

  static enrich (imageData: ImageData) {
    return ImageFilters.Enrich(imageData)
  }

  static solarize (imageData: ImageData) {
    return ImageFilters.Solarize(imageData)
  }

  static emboss (imageData: ImageData) {
    return ImageFilters.Emboss(imageData)
  }

  static edge (imageData: ImageData) {
    return ImageFilters.Edge(imageData)
  }

  /**
   * @param {number} factor - The higher this number, the blurrier the image will be. If it is too large, the image will become transparent.
   */

  static stackBlur (imageData: ImageData, factor: number) {
    const desiredFactor = factor <= 0 ? 1 : factor
    return ImageFilters.StackBlur(imageData, desiredFactor)
  }

  /**
   * @param {number} level - The lower this number, the more posterizing the image will be.
   */

  static posterize (imageData: ImageData, level: number) {
    return ImageFilters.Posterize(imageData, level)
  }

  /**
   * @param {number} factor - If it is greater than 0, the larger this number, the sharper the image. Same effect if it is less than 0.
   */

  static sharpen (imageData: ImageData, factor: number) {
    return ImageFilters.Sharpen(imageData, factor)
  }
}
