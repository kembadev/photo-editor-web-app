export class NetworkError extends Error {
  readonly name: string

  constructor (msg: string) {
    super(msg)
    this.name = 'NetworkError'
  }
}
