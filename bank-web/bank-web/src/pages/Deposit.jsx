import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import AmountInput from '../components/AmountInput.jsx'
import { money, moneyFromCents } from '../format.js'

const QUICK = [5000, 10000, 50000]

export default function Deposit() {
  const { account, refresh } = useAuth()
  const [cents, setCents] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)

  if (!account) return null

  async function submit(e) {
    e.preventDefault()
    if (cents < 1) return setError('Informe um valor maior que zero.')
    setBusy(true)
    setError('')
    try {
      const tx = await api.deposit({ targetAccountId: account.id, amount: Number((cents / 100).toFixed(2)) })
      setDone(tx)
      refresh().catch(() => {})
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <>
        <header className="page-head"><h1>Depósito realizado</h1></header>
        <section className="panel receipt">
          <p className="receipt-amount">{money(done.amount)}</p>
          <p className="muted-text">Já está no seu saldo.</p>
          <div className="actions">
            <button className="btn primary" onClick={() => { setDone(null); setCents(0) }}>Novo depósito</button>
            <Link className="btn" to="/">Voltar ao resumo</Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <header className="page-head"><h1>Depositar</h1></header>
      <section className="panel narrow">
        <form onSubmit={submit} noValidate>
          <AmountInput cents={cents} onChange={setCents} error={error} autoFocus />
          <div className="quick">
            {QUICK.map((q) => (
              <button type="button" key={q} className="chip-btn" onClick={() => setCents((c) => c + q)}>
                + {moneyFromCents(q)}
              </button>
            ))}
          </div>
          <button className="btn primary" disabled={busy}>
            {busy ? 'Depositando…' : cents ? `Depositar ${moneyFromCents(cents)}` : 'Depositar'}
          </button>
        </form>
      </section>
    </>
  )
}
