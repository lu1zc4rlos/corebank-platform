// Cliente HTTP do Core Bank. Rotas conforme os controllers do corebank-api.
const BASE = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'corebank.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se a API está em execução.')
  }

  let data = null
  try { data = await res.json() } catch { /* corpo vazio */ }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      tokenStore.clear()
      onUnauthorized()
      throw new ApiError(401, 'Sua sessão expirou. Entre novamente.')
    }
    throw new ApiError(res.status, data?.message || 'Algo deu errado. Tente novamente.', data?.errors)
  }
  return data
}

export const api = {
  login: (email, password) =>
    request('/api/autenticacao/login', { method: 'POST', auth: false, body: { email, password } }),
  register: (payload) =>
    request('/api/autenticacao/cadastrar-se', { method: 'POST', auth: false, body: payload }),
  me: () => request('/api/usuarios/me'),
  accounts: () => request('/api/contas'),
  statement: (accountId) => request(`/api/contas/${accountId}/transactions`),
  transfer: (body) => request('/api/transacoes/transferencia', { method: 'POST', body }),
  deposit: (body) => request('/api/transacoes/deposito', { method: 'POST', body }),
}
