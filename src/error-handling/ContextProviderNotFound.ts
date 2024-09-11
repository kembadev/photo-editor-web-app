export class ContextProviderNotFound extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'ContextProviderNotFound'
  }
}
