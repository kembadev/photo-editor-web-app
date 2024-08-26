type ValueResult<T> = T | null
type ErrorResult<E> = E | null

export class Result<T, E> {
  readonly value: ValueResult<T>
  readonly success: boolean
  readonly error: ErrorResult<E>

  constructor (value: ValueResult<T>, success: boolean, error: ErrorResult<E>) {
    this.value = value
    this.success = success
    this.error = error
  }

  static Successful<T, E = null> (value: T): Result<T, E> {
    return new Result<T, E>(value, true, null)
  }

  static Failed<T, E = string> ({
    value = null,
    error = null
  }: {
    value?: ValueResult<T>,
    error?: ErrorResult<E>
  } = {}
  ): Result<T, E> {
    return new Result<T, E>(value, false, error)
  }
}
