import ImageFilters from 'canvas-filters'

import { ImageError } from '../error-handling/ImageError.ts'

interface TwirlConfig {
  imageData: ImageData;
  twirlCenterX: number;
  twirlCenterY: number;
  radius: number;
  angle: `${number}turn`;
  edge?: 'clamp' | 'wrap';
  smooth?: boolean
}

export class Filters {
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
   * @param {TwirlConfig} twirlConfig - Object that contains the twirl configuration.
   * @param {number} twirlConfig.twirlCenterX - The center of the twirl in X written as a number between 0 and 1.
   * @param {number} twirlConfig.twirlCenterY - The center of the twirl in Y written as a number between 0 and 1.
   * @param {number} twirlConfig.radius - The radius of the twirl expressed in pixels.
   */

  static twirl ({ imageData, twirlCenterX, twirlCenterY, radius, angle, edge = 'clamp', smooth = true }: TwirlConfig) {
    const desiredAngle = parseFloat(angle) * 360

    if (isNaN(desiredAngle)) {
      throw new ImageError('The angle must be presented as number of turns. E.g. "0.7turn", "-1.55turn"')
    }

    if ([twirlCenterX, twirlCenterY].some(c => c < 0 || c > 1)) {
      throw new ImageError('twirlCenter must be a number between 0 and 1')
    }

    const desiredEdge = edge === 'clamp' ? 1 : 2

    return ImageFilters.Twril(imageData, twirlCenterX, twirlCenterY, radius, desiredAngle, desiredEdge, smooth)
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
