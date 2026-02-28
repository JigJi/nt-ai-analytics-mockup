import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import TimelineExplorer from './pages/TimelineExplorer.jsx'
import AICopilot from './pages/AICopilot.jsx'
import AIAuditMonitor from './pages/AIAuditMonitor.jsx'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    sublabel: 'The Findings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline Explorer',
    sublabel: 'The Complexity',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'copilot',
    label: 'AI Copilot',
    sublabel: 'The Suggestion',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'audit',
    label: 'AI Audit Monitor',
    sublabel: 'The Quality Gap',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
]

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const pages = { dashboard: Dashboard, timeline: TimelineExplorer, copilot: AICopilot, audit: AIAuditMonitor }
  const ActivePage = pages[activePage]

  return (
    <div className="flex h-screen overflow-hidden bg-nt-gray">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: '#2E3192' }}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                 style={{ background: '#FFD100', color: '#2E3192' }}>
              NT
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">NT Analytics</p>
              <p className="text-white/50 text-xs">AI Insights Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group
                ${activePage === item.id
                  ? 'text-nt-blue font-semibold shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              style={activePage === item.id ? { background: '#FFD100' } : {}}
            >
              <span className={activePage === item.id ? 'text-nt-blue' : 'text-white/60 group-hover:text-white'}>
                {item.icon}
              </span>
              <div>
                <p className="text-sm leading-tight">{item.label}</p>
                <p className={`text-xs leading-tight ${activePage === item.id ? 'text-nt-blue/70' : 'text-white/40'}`}>
                  {item.sublabel}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs">Data: Oct 2025</p>
          <p className="text-white/30 text-xs">186,184 Events · 6,665 Tickets</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <ActivePage />
      </main>
    </div>
  )
}
