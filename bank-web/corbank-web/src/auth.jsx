import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from './api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null) // { ...user, accounts }
  const [accountId, setAccountId] = useState(null)
  const [loading, setLoading] = useState(Boolean(tokenStore.get()))

  const clear = useCallback(() => {
    tokenStore.clear()
    setProfile(null)
    setAccountId(null)
  }, [])

  const refresh = useCallback(async () => {
    const me = await api.me()
    setProfile(me)
    setAccountId((cur) => (me.accounts.some((a) => a.id === cur) ? cur : me.accounts[0]?.id ?? null))
    return me
  }, [])

  useEffect(() => { setUnauthorizedHandler(clear) }, [clear])

  useEffect(() => {
    if (!tokenStore.get()) return
    refresh().catch(clear).finally(() => setLoading(false))
  }, [refresh, clear])

  const login = useCallback(async (email, password) => {
    const { token } = await api.login(email.trim(), password)
    tokenStore.set(token)
    await refresh()
  }, [refresh])

  const register = useCallback(async (payload) => {
    const { token } = await api.register(payload)
    tokenStore.set(token)
    await refresh()
  }, [refresh])

  const value = useMemo(() => {
    const accounts = profile?.accounts ?? []
    return {
      loading,
      user: profile,
      accounts,
      account: accounts.find((a) => a.id === accountId) ?? accounts[0] ?? null,
      selectAccount: setAccountId,
      isAuthenticated: Boolean(profile),
      login, register, refresh, logout: clear,
    }
  }, [profile, accountId, loading, login, register, refresh, clear])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
