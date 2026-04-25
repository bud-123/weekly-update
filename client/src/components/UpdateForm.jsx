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

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function lerpHex(colorA, colorB, t) {
  const [ar, ag, ab] = hexToRgb(colorA)
  const [br, bg, bb] = hexToRgb(colorB)
  const r = Math.round(ar + (br - ar) * t).toString(16).padStart(2, '0')
  const g = Math.round(ag + (bg - ag) * t).toString(16).padStart(2, '0')
  const b = Math.round(ab + (bb - ab) * t).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

function moraleColor(val) {
  if (val <= 3) return lerpHex('#E07060', '#F0A040', (val - 1) / 2)
  return lerpHex('#F0A040', '#3EC86A', (val - 3) / 2)
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

  const moraleInfo  = MORALE[morale]
  const mc          = moraleColor(morale)
  const mp          = `${((morale - 1) / 4) * 100}%`
  const moraleLevel = morale <= 2 ? 'low' : morale >= 4 ? 'high' : 'mid'
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

      <div className="form-sections">

        {/* Key Metrics */}
        <div className="form-section">
          <span className="form-section-label">Key Metrics</span>
          <div className="metrics-rows">
            {metrics.map(m => (
              <div key={m.id} className="metric-row">
                <div className="float-field">
                  <input
                    className="field"
                    placeholder=" "
                    value={m.label}
                    onChange={e => updateMetric(m.id, 'label', e.target.value)}
                  />
                  <span className="float-label">Metric</span>
                </div>
                <div className="float-field">
                  <input
                    className="field"
                    placeholder=" "
                    value={m.value}
                    onChange={e => updateMetric(m.id, 'value', e.target.value)}
                  />
                  <span className="float-label">Value</span>
                </div>
                <button
                  className="metric-remove"
                  onClick={() => setMetrics(prev => prev.filter(r => r.id !== m.id))}
                  title="Remove"
                >×</button>
              </div>
            ))}
          </div>
          <button className="btn-add-metric" onClick={() => setMetrics(p => [...p, newRow()])}>
            + Add metric
          </button>
        </div>

        {/* Progress & Blockers — Split */}
        <div className="form-section">
          <div className="split-grid">
            <div className="split-col">
              <label className="form-section-label">The Wins</label>
              <textarea
                className="field"
                placeholder="What shipped or moved forward this week?"
                value={progress}
                onChange={e => setProgress(e.target.value)}
              />
            </div>
            <div className="split-divider" />
            <div className="split-col">
              <label className="form-section-label">The Friction</label>
              <textarea
                className="field"
                placeholder="What slowed you down or remains unresolved?"
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
              />
            </div>
          </div>
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
        <div
          className={`form-section morale-card morale-card--${moraleLevel}`}
          style={{ '--mc': mc, '--mp': mp }}
        >
          <span className="form-section-label">Morale</span>
          <div className="morale-slider-wrap">
            <input
              type="range"
              className="morale-slider"
              min="1" max="5" step="1"
              value={morale}
              onChange={e => setMorale(Number(e.target.value))}
            />
            <div className="morale-endpoints">
              <span className="morale-endpoint-icon" style={{ color: '#E07060' }}>
                <TrendIcon trend="down" size={13} />
              </span>
              <span className="morale-endpoint-icon" style={{ color: '#F0A040' }}>
                <TrendIcon trend="flat" size={13} />
              </span>
              <span className="morale-endpoint-icon" style={{ color: '#3EC86A' }}>
                <TrendIcon trend="up" size={13} />
              </span>
            </div>
          </div>
          <p className="morale-status" style={{ color: mc }}>
            <span className="morale-status-icon">
              <TrendIcon trend={moraleInfo.trend} size={14} />
            </span>
            <strong style={{ color: mc }}>{moraleInfo.label}</strong>
          </p>
        </div>

        {/* The Ask */}
        <div className="form-section">
          <label className="form-section-label">The Ask</label>
          <div className="ask-wrapper">
            <textarea
              className="field"
              placeholder="What do you need from your stakeholders right now?"
              value={ask}
              onChange={e => setAsk(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* Send */}
      <div className="send-bar">
        <p className="send-meta">
          {subCount === null ? 'Loading…' : subCount === 0 ? 'No subscribers yet' : `${subCount} subscriber${subCount !== 1 ? 's' : ''}`}
        </p>
        <div className="send-actions">
          <button
            className={testBtnClass}
            onClick={handleSendTest}
            disabled={!canSendTest}
            title={!hasTestRecipient ? 'Set a test recipient in the Subscribers tab' : ''}
          >
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
