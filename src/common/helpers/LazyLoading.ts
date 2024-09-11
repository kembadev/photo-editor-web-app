import { IS_DEVELOPMENT } from '../../config.ts'

import { getInternetConnectionStatus } from './NetworkStatus.ts'
import { InternetConnectionDownException } from '../../error-handling/ConnectionError.ts'

interface DynamicImportBase<T, U extends boolean> {
  returnedValue: T;
  importRightNow: U;
  isAlreadyImported: U extends true ? true : boolean
}

type DynamicImport<T> = Promise<
  DynamicImportBase<T, true> |
  DynamicImportBase<() => Promise<T>, false>
>

export async function lazyLoading<T> (
  load: () => Promise<T>,
  importRightNow = false
): DynamicImport<T> {
  if (importRightNow) {
    return {
      importRightNow,
      returnedValue: await load(),
      isAlreadyImported: true
    }
  }

  return { importRightNow, returnedValue: () => load(), isAlreadyImported: false }
}

export async function suspenseLoading<T> (
  load: DynamicImport<T>
): Promise<T> {
  const res = await load
  const { returnedValue, importRightNow, isAlreadyImported } = res

  if (importRightNow) return returnedValue

  if (IS_DEVELOPMENT) {
    res.isAlreadyImported = true
    return returnedValue()
  }

  if (!isAlreadyImported) {
    const ok = await getInternetConnectionStatus()

    if (!ok) {
      throw new InternetConnectionDownException('No internet connection. Try again later.')
    }

    res.isAlreadyImported = true
  }

  return returnedValue()
}
