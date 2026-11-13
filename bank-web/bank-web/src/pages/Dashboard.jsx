import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import TxRow from '../components/TxList.jsx'
import { money } from '../format.js'
import { useStatement } from '../useStatement.js'

export default function Dashboard() {
  const { user, account } = useAuth()
  const { items, loading, error, reload } = useStatement(account?.id)
  const [hidden, setHidden] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!account) return <p>Nenhuma conta encontrada para este usuário.</p>

  async function copyId() {
    try {
      await navigator.clipboard.writeText(account.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* área de transferência indisponível */ }
  }

  return (
    <>
      <header className="page-head">
        <h1>Olá, {user.name.split(' ')[0]}</h1>
      </header>

      <section className="account-card" aria-label="Conta">
        <div className="account-top">
          <span>{account.type === 'SAVINGS' ? 'Conta poupança' : 'Conta corrente'}</span>
          {account.status !== 'ACTIVE' && <b className="chip failed">{account.status === 'BLOCKED' ? 'Bloqueada' : 'Encerrada'}</b>}
        </div>
        <div className="balance-label">Saldo disponível</div>
        <div className="balance">{hidden ? 'R$ ••••••' : money(account.balance)}</div>
        <button className="link light" onClick={() => setHidden((h) => !h)}>
          {hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
        </button>
        <dl className="account-ids">
          <div><dt>Agência</dt><dd>{account.branch}</dd></div>
          <div><dt>Conta</dt><dd>{account.number}</dd></div>
          <div className="wide">
            <dt>ID para receber transferências</dt>
            <dd>
              <code>{account.id}</code>
              <button className="link light" onClick={copyId}>{copied ? 'Copiado' : 'Copiar'}</button>
            </dd>
          </div>
        </dl>
      </section>

      <div className="actions">
        <Link className="btn primary" to="/depositar">Depositar</Link>
        <Link className="btn" to="/transferir">Transferir</Link>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Últimas movimentações</h2>
          <Link to="/extrato">Ver extrato completo</Link>
        </div>
        {loading ? <p className="muted-text">Carregando…</p>
          : error ? <p className="form-error">{error} <button className="link" onClick={reload}>Tentar de novo</button></p>
          : items.length === 0 ? <p className="muted-text">Sem movimentações ainda. Faça um depósito para começar.</p>
          : <ul className="tx-list">{items.slice(0, 5).map((t) => <TxRow key={t.id} tx={t} accountId={account.id} />)}</ul>}
      </section>
    </>
  )
}
