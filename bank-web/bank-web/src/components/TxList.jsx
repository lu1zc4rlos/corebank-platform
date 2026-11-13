import { describeTx, money, STATUS_LABEL, timeLabel } from '../format.js'

export default function TxRow({ tx, accountId }) {
  const { isOut, title, detail } = describeTx(tx, accountId)
  const failed = tx.status === 'FAILED' || tx.status === 'REVERSED'
  return (
    <li className="tx">
      <div className="tx-main">
        <span className="tx-title">{title}</span>
        {detail && <span className="tx-detail">{detail}</span>}
      </div>
      <div className="tx-side">
        <span className={`tx-amount ${failed ? 'muted' : isOut ? 'out' : 'in'}`}>
          {isOut ? '−' : '+'} {money(tx.amount)}
        </span>
        <span className="tx-time">
          {STATUS_LABEL[tx.status] ? <b className={`chip ${tx.status.toLowerCase()}`}>{STATUS_LABEL[tx.status]}</b> : null}
          {timeLabel(tx.createdAt)}
        </span>
      </div>
    </li>
  )
}
