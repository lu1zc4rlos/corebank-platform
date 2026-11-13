const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const money = (v) => brl.format(Number(v ?? 0))
export const moneyFromCents = (c) => brl.format((c || 0) / 100)

export const onlyDigits = (s = '') => s.replace(/\D/g, '')

export const maskCpf = (s) => {
  const d = onlyDigits(s).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export const maskPhone = (s) => {
  const d = onlyDigits(s).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function isValidCpf(value) {
  const d = onlyDigits(value)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const calc = (len) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10])
}

export function ageFrom(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const now = new Date()
  let age = now.getFullYear() - y
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--
  return age
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (s) => UUID_RE.test((s || '').trim())

export const dayLabel = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
export const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
export const dateTimeLabel = (iso) => `${dayLabel(iso)}, ${timeLabel(iso)}`

export const shortId = (id) => (id ? `${id.slice(0, 8)}…` : '')

// Interpreta uma transação do ponto de vista da conta aberta.
export function describeTx(tx, accountId) {
  const isOut =
    tx.type === 'WITHDRAWAL' ||
    ((tx.type === 'TRANSFER_OUT' || tx.type === 'TRANSFER_IN') && tx.sourceAccountId === accountId)
  let title = 'Movimentação'
  if (tx.type === 'DEPOSIT') title = 'Depósito'
  else if (tx.type === 'WITHDRAWAL') title = 'Saque'
  else title = isOut ? 'Transferência enviada' : 'Transferência recebida'
  const other = isOut ? tx.targetAccountId : tx.sourceAccountId
  const detail = tx.description && tx.type !== 'DEPOSIT'
    ? tx.description
    : tx.type.startsWith('TRANSFER') ? `Conta ${shortId(other)}` : ''
  return { isOut, title, detail }
}

export const STATUS_LABEL = {
  PENDING: 'Pendente',
  FAILED: 'Falhou',
  REVERSED: 'Estornada',
}
