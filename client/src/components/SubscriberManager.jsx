import { useState, useEffect } from 'react'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function TestRecipient() {
  const [current, setCurrent]   = useState(null)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  async function load() {
    const res = await fetch('/api/test-recipient')
    setCurrent(await res.json())
  }

  useEffect(() => { load() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/test-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); return }
      setName('')
      setEmail('')
      await load()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    await fetch('/api/test-recipient', { method: 'DELETE' })
    await load()
  }

  const isSet = current?.email

  return (
    <div className="test-recipient-section">
      <div className="test-recipient-header">
        <span className="test-badge">TEST</span>
        <h3 className="test-recipient-title">Test Recipient</h3>
      </div>
      <p className="test-recipient-desc">
        Sends a live email to one address so you can preview before sending to all subscribers.
      </p>

      {isSet ? (
        <div className="test-recipient-current">
          <div className="sub-info">
            <div className="sub-name">{current.name}</div>
            <div className="sub-email">{current.email}</div>
          </div>
          <button className="btn-remove" onClick={handleClear}>Clear</button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="test-recipient-form">
          <div className="add-form-fields">
            <input
              className="field"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              className="field"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn-add"
            disabled={saving || !name.trim() || !email.trim()}
          >
            {saving ? 'Saving…' : 'Set Test Recipient'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState([])
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError]   = useState('')

  async function load() {
    const res = await fetch('/api/subscribers')
    setSubscribers(await res.json())
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add subscriber.')
      } else {
        setName('')
        setEmail('')
        await load()
      }
    } catch {
      setError('Network error — is the server running?')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(addr) {
    await fetch(`/api/subscribers/${encodeURIComponent(addr)}`, { method: 'DELETE' })
    await load()
  }

  const n = subscribers.length

  return (
    <div>
      <TestRecipient />

      <div className="subscribers-divider" />

      <div className="sub-header">
        <h2 className="sub-heading">Subscribers</h2>
        {n > 0 && <span className="sub-count">{n} subscriber{n !== 1 ? 's' : ''}</span>}
      </div>

      {n === 0 ? (
        <div className="sub-empty">No subscribers yet. Add one below to get started.</div>
      ) : (
        <div className="sub-list">
          {subscribers.map(sub => (
            <div key={sub.email} className="sub-item">
              <div className="sub-info">
                <div className="sub-name">{sub.name}</div>
                <div className="sub-email">{sub.email}</div>
              </div>
              {sub.addedAt && (
                <span className="sub-date">{fmtDate(sub.addedAt)}</span>
              )}
              <button className="btn-remove" onClick={() => handleRemove(sub.email)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="add-form">
        <p className="add-form-title">Add Subscriber</p>
        <form onSubmit={handleAdd}>
          <div className="add-form-fields">
            <input
              className="field"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              className="field"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn-add"
            disabled={adding || !name.trim() || !email.trim()}
          >
            {adding ? 'Adding…' : 'Add Subscriber'}
          </button>
        </form>
      </div>
    </div>
  )
}
