export class TaskQueue<T> {
  #tasks: T[] = []

  enqueue (overload: T) {
    this.#tasks.push(overload)
  }

  dequeue () {
    return this.#tasks.shift()
  }

  getTasksLength () {
    return this.#tasks.length
  }

  clear () {
    this.#tasks.splice(0, this.#tasks.length)
    return this.#tasks.length
  }
}
