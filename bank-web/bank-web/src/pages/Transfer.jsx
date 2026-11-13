import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import AmountInput from '../components/AmountInput.jsx'
import Field from '../components/Field.jsx'
import { dateTimeLabel, isUuid, money, moneyFromCents } from '../format.js'

export default function Transfer() {
  const { account, refresh } = useAuth()
  const [target, setTarget] = useState('')
  const [cents, setCents] = useState(0)
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('form') // form | review | done
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [receipt, setReceipt] = useState(null)

  if (!account) return null

  function review(e) {
    e.preventDefault()
    const v = {}
    if (!isUuid(target)) v.target = 'Informe o ID da conta de destino (formato 00000000-0000-0000-0000-000000000000).'
    else if (target.trim().toLowerCase() === account.id) v.target = 'O destino deve ser diferente da sua conta.'
    if (cents < 1) v.amount = 'Informe um valor maior que zero.'
    else if (cents / 100 > Number(account.balance)) v.amount = `Saldo insuficiente. Disponível: ${money(account.balance)}.`
    setErrors(v)
    if (!Object.keys(v).length) { setFormError(''); setStep('review') }
  }

  async function confirm() {
    setBusy(true)
    setFormError('')
    try {
      const tx = await api.transfer({
        sourceAccountId: account.id,
        targetAccountId: target.trim(),
        amount: Number((cents / 100).toFixed(2)),
        description: description.trim() || null,
      })
      setReceipt(tx)
      setStep('done')
      refresh().catch(() => {})
    } catch (err) {
      setFormError(err.message)
      setStep('form')
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setTarget(''); setCents(0); setDescription(''); setErrors({}); setReceipt(null); setFormError(''); setStep('form')
  }

  if (step === 'done') {
    return (
      <>
        <header className="page-head"><h1>Transferência enviada</h1></header>
        <section className="panel receipt">
          <p className="receipt-amount">{money(receipt.amount)}</p>
          <dl>
            <div><dt>Para a conta</dt><dd><code>{receipt.targetAccountId}</code></dd></div>
            {receipt.description && <div><dt>Descrição</dt><dd>{receipt.description}</dd></div>}
            <div><dt>Data</dt><dd>{dateTimeLabel(receipt.createdAt)}</dd></div>
            <div><dt>Comprovante</dt><dd><code>{receipt.id}</code></dd></div>
          </dl>
          <div className="actions">
            <button className="btn primary" onClick={reset}>Nova transferência</button>
            <Link className="btn" to="/extrato">Ver extrato</Link>
          </div>
        </section>
      </>
    )
  }

  if (step === 'review') {
    return (
      <>
        <header className="page-head"><h1>Confirmar transferência</h1></header>
        <section className="panel receipt">
          <p className="receipt-amount">{moneyFromCents(cents)}</p>
          <dl>
            <div><dt>Da conta</dt><dd>{account.branch} / {account.number}</dd></div>
            <div><dt>Para a conta</dt><dd><code>{target.trim()}</code></dd></div>
            {description.trim() && <div><dt>Descrição</dt><dd>{description.trim()}</dd></div>}
          </dl>
          <div className="actions">
            <button className="btn primary" onClick={confirm} disabled={busy}>
              {busy ? 'Enviando…' : `Transferir ${moneyFromCents(cents)}`}
            </button>
            <button className="btn" onClick={() => setStep('form')} disabled={busy}>Voltar e editar</button>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <header className="page-head"><h1>Transferir</h1></header>
      <section className="panel narrow">
        <p className="muted-text">Saldo disponível: <b>{money(account.balance)}</b></p>
        <form onSubmit={review} noValidate>
          <Field label="ID da conta de destino" value={target} spellCheck={false} autoComplete="off"
            onChange={(e) => setTarget(e.target.value)} error={errors.target}
            hint="A pessoa que vai receber encontra esse ID na tela de Resumo e pode copiá-lo." />
          <AmountInput cents={cents} onChange={setCents} error={errors.amount} />
          <Field label="Descrição (opcional)" maxLength={255} value={description}
            onChange={(e) => setDescription(e.target.value)} />
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="btn primary">Revisar transferência</button>
        </form>
      </section>
    </>
  )
}
