import { useMemo, useState } from 'react'
import { useAuth } from '../auth.jsx'
import TxRow from '../components/TxList.jsx'
import { dayLabel, describeTx } from '../format.js'
import { useStatement } from '../useStatement.js'

const FILTERS = [
  { id: 'all', label: 'Tudo' },
  { id: 'in', label: 'Entradas' },
  { id: 'out', label: 'Saídas' },
]

export default function Statement() {
  const { account } = useAuth()
  const { items, loading, error, reload } = useStatement(account?.id)
  const [filter, setFilter] = useState('all')

  const groups = useMemo(() => {
    const out = []
    for (const tx of items) {
      const { isOut } = describeTx(tx, account.id)
      if (filter === 'in' && isOut) continue
      if (filter === 'out' && !isOut) continue
      const key = dayLabel(tx.createdAt)
      const last = out[out.length - 1]
      if (last && last.key === key) last.items.push(tx)
      else out.push({ key, items: [tx] })
    }
    return out
  }, [items, filter, account])

  if (!account) return null

  return (
    <>
      <header className="page-head">
        <h1>Extrato</h1>
        <div className="seg" role="group" aria-label="Filtrar">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? 'on' : ''} aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </header>
      <section className="panel">
        {loading ? <p className="muted-text">Carregando…</p>
          : error ? <p className="form-error">{error} <button className="link" onClick={reload}>Tentar de novo</button></p>
          : groups.length === 0 ? <p className="muted-text">Nenhuma movimentação neste filtro.</p>
          : groups.map((g) => (
            <div key={g.key} className="day">
              <h2>{g.key}</h2>
              <ul className="tx-list">{g.items.map((t) => <TxRow key={t.id} tx={t} accountId={account.id} />)}</ul>
            </div>
          ))}
      </section>
    </>
  )
}
