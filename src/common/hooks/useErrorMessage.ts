import { useCallback, useState } from 'react'

export function useErrorMessage () {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const updateErrorMessage = useCallback((message: string | null) => {
    setErrorMessage(message)
  }, [])

  return { errorMessage, updateErrorMessage }
}
