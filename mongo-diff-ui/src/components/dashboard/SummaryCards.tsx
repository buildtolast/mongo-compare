import type { ComparisonResult } from '@/types/comparison'

interface SummaryCardsProps {
  result: ComparisonResult
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const retentionRate = result.total_before > 0
    ? Math.round((result.total_after / result.total_before) * 100)
    : 0

  const deletedPercentage = result.total_before > 0
    ? Math.round((result.deleted.count / result.total_before) * 100)
    : 0

  const updatedPercentage = result.total_before > 0
    ? Math.round((result.updated.count / result.total_before) * 100)
    : 0

  return (
    <ul className="summary-cards" role="list">
      <li className="summary-card source">
        <div className="summary-number">{result.total_before}</div>
        <div className="summary-label">Before</div>
        <div className="summary-label">Docs</div>
      </li>
      <li className="summary-card target">
        <div className="summary-number">{result.total_after}</div>
        <div className="summary-label">After</div>
        <div className="summary-label">Docs</div>
      </li>
      <li className="summary-card deleted">
        <div className="summary-number">{result.deleted.count}</div>
        <div className="summary-label">Deleted</div>
        <div className="percentage">({deletedPercentage}%)</div>
        {result.created.count === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>0 added</div>}
      </li>
      <li className="summary-card updated">
        <div className="summary-number">{result.updated.count}</div>
        <div className="summary-label">Updated</div>
        <div className="percentage">({updatedPercentage}%)</div>
        {result.created.count === 0 && <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>0 added</div>}
      </li>
      <li className="summary-card retention">
        <div className="summary-number">{retentionRate}%</div>
        <div className="summary-label">Retention</div>
      </li>
    </ul>
  )
}