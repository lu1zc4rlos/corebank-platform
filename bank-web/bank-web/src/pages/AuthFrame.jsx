export default function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <section className="auth-brand">
        <div className="wordmark light">Core Bank</div>
        <p className="auth-pitch">Seu dinheiro, do jeito que você precisa dele.</p>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
          {children}
          <p className="auth-foot">{footer}</p>
        </div>
      </section>
    </div>
  )
}
