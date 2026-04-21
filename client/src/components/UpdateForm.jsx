import { useState, useEffect } from 'react'

const MORALE = {
  1: { trend: 'down', label: 'Rough Week' },
  2: { trend: 'down', label: 'Under Pressure' },
  3: { trend: 'flat', label: 'Holding Steady' },
  4: { trend: 'up',   label: 'Good Momentum' },
  5: { trend: 'up',   label: 'Firing on All Cylinders' },
}

const TREND_PATHS = {
  up:   'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  flat: 'M22 12l-4-4v3H3v2h15v3z',
  down: 'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
}

function TrendIcon({ trend, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={TREND_PATHS[trend]} />
    </svg>
  )
}

function weekLabel() {
  return `Week of ${new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })}`
}

function newRow() {
  return { id: crypto.randomUUID(), label: '', value: '' }
}

export default function UpdateForm() {
  const label = weekLabel()
  const [metrics, setMetrics]   = useState([newRow(), newRow()])
  const [progress, setProgress] = useState('')
  const [blockers, setBlockers] = useState('')
  const [focus, setFocus]       = useState('')
  const [morale, setMorale]     = useState(3)
  const [ask, setAsk]           = useState('')
  const [subCount, setSubCount]       = useState(null)
  const [hasTestRecipient, setHasTest] = useState(false)
  const [sending, setSending]         = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [feedback, setFeedback]       = useState(null)

  useEffect(() => {
    fetch('/api/subscribers')
      .then(r => r.json())
      .then(d => setSubCount(d.length))
      .catch(() => setSubCount(0))
    fetch('/api/test-recipient')
      .then(r => r.json())
      .then(d => setHasTest(!!d.email))
      .catch(() => {})
  }, [])

  function updateMetric(id, field, val) {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m))
  }

  async function send(testOnly = false) {
    if (testOnly) setSendingTest(true); else setSending(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekLabel: label,
          metrics: metrics.filter(m => m.label || m.value),
          progress, blockers, focus, morale, ask,
          testOnly,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ type: 'error', msg: data.error || 'Failed to send.' })
      } else {
        const n = data.sent
        const f = data.failed
        setFeedback({
          type: 'success',
          msg: testOnly
            ? 'Test email sent.'
            : `Sent to ${n} subscriber${n !== 1 ? 's' : ''}${f > 0 ? ` — ${f} failed` : ''}.`,
        })
        setTimeout(() => setFeedback(null), 6000)
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Network error — is the server running?' })
    } finally {
      setSending(false)
      setSendingTest(false)
    }
  }

  const handleSend     = () => send(false)
  const handleSendTest = () => send(true)

  const moraleInfo = MORALE[morale]
  const anySending = sending || sendingTest
  const canSend     = !anySending && subCount > 0
  const canSendTest = !anySending && hasTestRecipient

  let btnClass = 'btn-send'
  if (!sendingTest && feedback?.type === 'success') btnClass += ' is-success'
  if (!sendingTest && feedback?.type === 'error')   btnClass += ' is-error'

  let testBtnClass = 'btn-send-test'
  if (sendingTest && feedback?.type === 'success') testBtnClass += ' is-success'
  if (sendingTest && feedback?.type === 'error')   testBtnClass += ' is-error'

  return (
    <div>
      <div className="week-display">
        <p className="week-eyebrow">This week's update</p>
        <h2 className="week-label">{label}</h2>
      </div>

      {/* Key Metrics */}
      <div className="form-section">
        <label className="form-section-label">Key Metrics</label>
        <div className="metrics-rows">
          {metrics.map(m => (
            <div key={m.id} className="metric-row">
              <input
                className="field"
                placeholder="Metric name"
                value={m.label}
                onChange={e => updateMetric(m.id, 'label', e.target.value)}
              />
              <input
                className="field"
                placeholder="Value"
                value={m.value}
                onChange={e => updateMetric(m.id, 'value', e.target.value)}
              />
              <button
                className="metric-remove"
                onClick={() => setMetrics(prev => prev.filter(r => r.id !== m.id))}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button className="btn-add-metric" onClick={() => setMetrics(p => [...p, newRow()])}>
          + Add metric
        </button>
      </div>

      {/* Progress */}
      <div className="form-section">
        <label className="form-section-label">Progress &amp; Wins</label>
        <textarea
          className="field"
          placeholder="What shipped or moved forward this week? (one item per line → becomes a list in the email)"
          value={progress}
          onChange={e => setProgress(e.target.value)}
        />
      </div>

      {/* Blockers */}
      <div className="form-section">
        <label className="form-section-label">Blockers &amp; Challenges</label>
        <textarea
          className="field"
          placeholder="What slowed you down or remains unresolved? (one item per line)"
          value={blockers}
          onChange={e => setBlockers(e.target.value)}
        />
      </div>

      {/* Focus */}
      <div className="form-section">
        <label className="form-section-label">Focus for Next Week</label>
        <textarea
          className="field"
          placeholder="What's the top priority heading into next week?"
          value={focus}
          onChange={e => setFocus(e.target.value)}
        />
      </div>

      {/* Morale */}
      <div className="form-section">
        <label className="form-section-label">Morale</label>
        <div className="morale-row">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`morale-btn morale-btn--${MORALE[n].trend}${morale === n ? ' active' : ''}`}
              onClick={() => setMorale(n)}
            >
              <span className="morale-icon"><TrendIcon trend={MORALE[n].trend} size={17} /></span>
              <span>{n}</span>
            </button>
          ))}
        </div>
        <p className="morale-status">
          <span className={`morale-status-icon morale-status-icon--${moraleInfo.trend}`}>
            <TrendIcon trend={moraleInfo.trend} size={14} />
          </span>
          <strong>{moraleInfo.label}</strong>
        </p>
      </div>

      {/* The Ask */}
      <div className="form-section">
        <label className="form-section-label">The Ask</label>
        <textarea
          className="field"
          placeholder="What do you need from your stakeholders right now?"
          value={ask}
          onChange={e => setAsk(e.target.value)}
        />
      </div>

      {/* Send */}
      <div className="send-bar">
        <p className="send-meta">
          {subCount === null ? 'Loading...' : subCount === 0 ? 'No subscribers yet' : `${subCount} subscriber${subCount !== 1 ? 's' : ''}`}
        </p>
        <div className="send-actions">
          <button className={testBtnClass} onClick={handleSendTest} disabled={!canSendTest} title={!hasTestRecipient ? 'Set a test recipient in the Subscribers tab' : ''}>
            {sendingTest ? 'Sending…' : 'Send Test'}
          </button>
          <button className={btnClass} onClick={handleSend} disabled={!canSend}>
            {sending ? 'Sending…' : 'Send to All →'}
          </button>
        </div>
      </div>

      {feedback && (
        <p className={`send-feedback ${feedback.type}`}>{feedback.msg}</p>
      )}
    </div>
  )
}
