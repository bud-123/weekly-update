import { useState } from 'react'
import UpdateForm from './components/UpdateForm.jsx'
import SubscriberManager from './components/SubscriberManager.jsx'

export default function App() {
  const [tab, setTab] = useState('update')

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <p className="app-eyebrow">Internal Tool</p>
            <h1 className="app-title">Weekly Updater</h1>
          </div>
          <nav className="app-tabs">
            <button
              className={`app-tab${tab === 'update' ? ' active' : ''}`}
              onClick={() => setTab('update')}
            >
              Update
            </button>
            <button
              className={`app-tab${tab === 'subscribers' ? ' active' : ''}`}
              onClick={() => setTab('subscribers')}
            >
              Subscribers
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {tab === 'update' ? <UpdateForm /> : <SubscriberManager />}
      </main>
    </div>
  )
}
