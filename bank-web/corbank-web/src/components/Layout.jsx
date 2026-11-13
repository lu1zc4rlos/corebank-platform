import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

const NAV = [
  { to: '/', label: 'Resumo', end: true },
  { to: '/extrato', label: 'Extrato' },
  { to: '/transferir', label: 'Transferir' },
  { to: '/depositar', label: 'Depositar' },
]

export default function Layout() {
  const { user, accounts, account, selectAccount, logout } = useAuth()
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="wordmark">Core Bank</div>
        <nav aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          {accounts.length > 1 && (
            <select aria-label="Conta ativa" value={account?.id} onChange={(e) => selectAccount(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.type === 'SAVINGS' ? 'Poupança' : 'Corrente'} {a.number}
                </option>
              ))}
            </select>
          )}
          <div className="who">
            <span>{user?.name}</span>
            <button className="link" onClick={logout}>Sair</button>
          </div>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
