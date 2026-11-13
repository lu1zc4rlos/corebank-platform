import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import Field from '../components/Field.jsx'
import { ageFrom, isValidCpf, maskCpf, maskPhone, onlyDigits } from '../format.js'
import AuthFrame from './AuthFrame.jsx'

const EMPTY = { name: '', email: '', cpf: '', birthDate: '', phone: '', password: '', confirm: '' }

function validate(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'Informe seu nome completo.'
  else if (f.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome.'
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'E-mail inválido.'
  if (!isValidCpf(f.cpf)) e.cpf = 'CPF inválido.'
  if (!f.birthDate) e.birthDate = 'Informe a data de nascimento.'
  else if (ageFrom(f.birthDate) < 18) e.birthDate = 'É necessário ter pelo menos 18 anos.'
  if (f.phone && onlyDigits(f.phone).length < 10) e.phone = 'Telefone incompleto.'
  if (f.password.length < 8) e.password = 'Use pelo menos 8 caracteres.'
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'A senha deve conter letras e números.'
  if (f.confirm !== f.password) e.confirm = 'As senhas não conferem.'
  return e
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [f, setF] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k, fmt = (v) => v) => (e) => setF((p) => ({ ...p, [k]: fmt(e.target.value) }))

  async function onSubmit(e) {
    e.preventDefault()
    setFormError('')
    const v = validate(f)
    setErrors(v)
    if (Object.keys(v).length) return
    setBusy(true)
    try {
      await register({
        name: f.name.trim(),
        email: f.email.trim(),
        cpf: onlyDigits(f.cpf),
        birthDate: f.birthDate,
        phone: f.phone || null,
        password: f.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      // Erros por campo vindos do Bean Validation (mesmos nomes do DTO).
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields)
      else if (err.message.includes('CPF')) setErrors({ cpf: err.message })
      else if (err.message.includes('E-mail')) setErrors({ email: err.message })
      else if (err.message.includes('anos')) setErrors({ birthDate: err.message })
      else setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthFrame
      title="Abrir conta"
      subtitle="Leva poucos minutos. Você já entra logado ao terminar."
      footer={<>Já tem conta? <Link to="/entrar">Entrar</Link></>}
    >
      <form onSubmit={onSubmit} noValidate>
        <Field label="Nome completo" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />
        <Field label="E-mail" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
        <div className="row">
          <Field label="CPF" inputMode="numeric" placeholder="000.000.000-00" value={f.cpf}
            onChange={set('cpf', maskCpf)} error={errors.cpf} />
          <Field label="Data de nascimento" type="date" autoComplete="bday" value={f.birthDate}
            onChange={set('birthDate')} error={errors.birthDate} />
        </div>
        <Field label="Telefone (opcional)" type="tel" autoComplete="tel" placeholder="(00) 00000-0000"
          value={f.phone} onChange={set('phone', maskPhone)} error={errors.phone} />
        <Field label="Senha" type="password" autoComplete="new-password" value={f.password}
          onChange={set('password')} error={errors.password} hint="Mínimo de 8 caracteres, com letras e números." />
        <Field label="Confirmar senha" type="password" autoComplete="new-password" value={f.confirm}
          onChange={set('confirm')} error={errors.confirm} />
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="btn primary block" disabled={busy}>{busy ? 'Criando conta…' : 'Criar conta'}</button>
      </form>
    </AuthFrame>
  )
}
