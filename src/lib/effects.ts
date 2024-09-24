import ImageFilters from 'canvas-filters'

import { ImageError } from '../error-handling/ImageError.ts'

interface TwirlConfig {
  imageData: ImageData;
  twirlCenterX?: number;
  twirlCenterY?: number;
  radius: number;
  angle: `${number}turn`;
  edge?: 'clamp' | 'wrap';
  smooth?: boolean
}

export class Effects {
  /**
   * @param {TwirlConfig} twirlConfig - Object that contains the twirl configuration.
   * @param {number} twirlConfig.twirlCenterX - The center of the twirl in X written as a number between 0 and 1. The default value is 0.5.
   * @param {number} twirlConfig.twirlCenterY - The center of the twirl in Y written as a number between 0 and 1. The default value is 0.5.
   * @param {number} twirlConfig.radius - The radius of the twirl expressed in pixels.
   */

  static twirl ({ imageData, twirlCenterX = 0.5, twirlCenterY = 0.5, radius, angle, edge = 'clamp', smooth = true }: TwirlConfig) {
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
}
