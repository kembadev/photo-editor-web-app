export type ListUnion<T> = T[number]

export interface EventListener {
  (evt: Event): void
}

export type FnDefType<T = undefined, Q = void> = T extends undefined
  ? () => Q
  : (payload: T) => Q
