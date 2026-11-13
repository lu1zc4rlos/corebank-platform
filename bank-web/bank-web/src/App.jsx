import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Deposit from './pages/Deposit.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Statement from './pages/Statement.jsx'
import Transfer from './pages/Transfer.jsx'

function Private({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="boot">Carregando…</div>
  if (!isAuthenticated) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return children
}

function Public({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="boot">Carregando…</div>
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Public><Login /></Public>} />
      <Route path="/cadastro" element={<Public><Register /></Public>} />
      <Route element={<Private><Layout /></Private>}>
        <Route index element={<Dashboard />} />
        <Route path="extrato" element={<Statement />} />
        <Route path="transferir" element={<Transfer />} />
        <Route path="depositar" element={<Deposit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
