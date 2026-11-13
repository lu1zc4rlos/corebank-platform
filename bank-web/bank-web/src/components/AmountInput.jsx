import { useId } from 'react'
import { moneyFromCents } from '../format.js'

// Campo de valor em reais: o usuário digita apenas números e a máscara preenche os centavos.
export default function AmountInput({ label = 'Valor', cents, onChange, error, autoFocus }) {
  const id = useId()
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="amount-input"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="R$ 0,00"
        value={cents ? moneyFromCents(cents) : ''}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, '').slice(0, 13)
          onChange(d ? parseInt(d, 10) : 0)
        }}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="field-msg error">{error}</p>}
    </div>
  )
}
