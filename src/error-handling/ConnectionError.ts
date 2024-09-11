export class InternetConnectionDownException extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'InternetConnectionDownException'
  }
}
