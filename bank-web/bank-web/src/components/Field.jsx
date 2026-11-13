import { useId } from 'react'

export default function Field({ label, error, hint, children, ...props }) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children ? children(id, describedBy) : (
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      )}
      {error ? <p className="field-msg error" id={`${id}-err`}>{error}</p>
        : hint ? <p className="field-msg" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  )
}
