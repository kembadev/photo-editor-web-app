export class TypeValidation extends Error {
  readonly name: string

  constructor (message: string) {
    super(message)
    this.name = 'TypeValidation'
  }
}
