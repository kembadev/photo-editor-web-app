import { useCallback, useState } from 'react'

export function useLoading ({ initialState }: { initialState: boolean }) {
  const [isLoading, setIsLoading] = useState(initialState)

  const updateIsLoading = useCallback(() => {
    setIsLoading(prevLoading => !prevLoading)
  }, [])

  return { isLoading, updateIsLoading }
}
