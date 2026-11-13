import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'

export function useStatement(accountId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!accountId) return
    setLoading(true)
    setError('')
    try {
      setItems(await api.statement(accountId))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => { load() }, [load])
  return { items, loading, error, reload: load }
}
