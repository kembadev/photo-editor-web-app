interface DynamicImportBase<T, U extends boolean> {
  returnedValue: T;
  importRightNow: U
}

type DynamicImport<T> = Promise<
  DynamicImportBase<T, true> |
  DynamicImportBase<() => Promise<T>, false>
>

export async function lazyLoading<T> (
  load: () => Promise<T>,
  importRightNow = false
): DynamicImport<T> {
  if (importRightNow) return { importRightNow, returnedValue: await load() }

  return { importRightNow, returnedValue: () => load() }
}

export async function suspenseLoading<T> (
  load: DynamicImport<T>
): Promise<T> {
  const { returnedValue, importRightNow } = await load

  if (importRightNow) return returnedValue

  return returnedValue()
}
