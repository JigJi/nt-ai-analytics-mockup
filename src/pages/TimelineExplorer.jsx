import { useState } from 'react'
import data from '../mockup_data.json'

const { timeline_tickets } = data

const TYPE_CONFIG = {
  'Open':                   { color: '#2E3192', bg: '#EEF0FF', label: 'Open' },
  'Reassignment':           { color: '#D69E2E', bg: '#FFFBEB', label: 'Reassigned' },
  'Status Change':          { color: '#805AD5', bg: '#FAF5FF', label: 'Status ↑' },
  'Operator update':        { color: '#38A169', bg: '#F0FFF4', label: 'Update' },
  'Phase Change':           { color: '#2B6CB0', bg: '#EBF8FF', label: 'Phase ↑' },
  'Priority Change':        { color: '#E53E3E', bg: '#FFF5F5', label: 'Priority!' },
  'Attachment Added':       { color: '#6B7280', bg: '#F9FAFB', label: 'Attach' },
  'Complete':               { color: '#38A169', bg: '#F0FFF4', label: 'Complete' },
  'Closure':                { color: '#2E3192', bg: '#EEF0FF', label: 'Closure' },
  'Closed':                 { color: '#1A1A2E', bg: '#F3F4F6', label: 'Closed' },
  'Assignee Change':        { color: '#D69E2E', bg: '#FFFBEB', label: 'Assign ↑' },
  'Assignment Group Change':{ color: '#D69E2E', bg: '#FFFBEB', label: 'Group ↑' },
  'Resolved':               { color: '#38A169', bg: '#F0FFF4', label: 'Resolved' },
  'Finish':                 { color: '#2E3192', bg: '#EEF0FF', label: 'Finish' },
  'Canceled':               { color: '#E53E3E', bg: '#FFF5F5', label: 'Canceled' },
  'Subcategory Change':     { color: '#805AD5', bg: '#FAF5FF', label: 'Cat ↑' },
  'Area Change':            { color: '#805AD5', bg: '#FAF5FF', label: 'Area ↑' },
}

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || { color: '#6B7280', bg: '#F9FAFB', label: type }
}

function ComplexityBadge({ n }) {
  if (n <= 12)  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Simple · {n} events</span>
  if (n <= 30)  return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Medium · {n} events</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Complex · {n} events</span>
}

export default function TimelineExplorer() {
  const [selectedId, setSelectedId] = useState(timeline_tickets[1]?.id)
  const selected = timeline_tickets.find(t => t.id === selectedId) || timeline_tickets[0]

  // Count event types for the selected ticket
  const typeCounts = {}
  selected.events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1 })
  const typeEntries = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])

  return (
    <div className="flex h-full fade-in">
      {/* Left: Ticket List */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">Timeline Explorer</h1>
          <p className="text-xs text-gray-400 mt-0.5">คลิก Ticket เพื่อดู Sequence</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {timeline_tickets.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                t.id === selectedId ? 'bg-blue-50 border-l-4' : 'border-l-4 border-transparent'
              }`}
              style={t.id === selectedId ? { borderLeftColor: '#2E3192' } : {}}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-800 font-mono">{t.id}</p>
                <ComplexityBadge n={t.n_events} />
              </div>
              <p className="text-xs text-gray-500 leading-tight line-clamp-2">{t.description}</p>
              <div className="flex gap-3 mt-1.5">
                <span className="text-xs text-gray-400">⏱ {t.duration_hr}h</span>
                <span className="text-xs text-gray-400">📅 {t.open_time?.slice(0,10)}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">แสดง 5 ตัวอย่างเชิงคัดสรร</p>
          <p className="text-xs text-gray-400 text-center">จากทั้งหมด 6,665 tickets</p>
        </div>
      </div>

      {/* Right: Timeline Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-sm font-bold text-gray-900">{selected.id}</p>
                <ComplexityBadge n={selected.n_events} />
              </div>
              <p className="text-sm text-gray-600 leading-snug max-w-2xl">{selected.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold" style={{ color: '#2E3192' }}>{selected.duration_hr}h</p>
              <p className="text-xs text-gray-400">Total Duration</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Open</p>
              <p className="text-xs font-medium text-gray-700">{selected.open_time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Close</p>
              <p className="text-xs font-medium text-gray-700">{selected.close_time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Root Cause</p>
              <p className="text-xs font-medium text-gray-700 max-w-xs">{selected.cause || '—'}</p>
            </div>
          </div>

          {/* Resolution */}
          {selected.resolution && (
            <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-100">
              <p className="text-xs text-green-600 font-medium mb-0.5">Final Resolution</p>
              <p className="text-xs text-green-800 leading-snug">{selected.resolution}</p>
            </div>
          )}

          {/* Event type summary */}
          <div className="flex flex-wrap gap-2 mt-3">
            {typeEntries.slice(0,8).map(([type, count]) => {
              const cfg = getTypeConfig(type)
              return (
                <span key={type} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label} × {count}
                </span>
              )
            })}
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="space-y-0">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 px-1">
            Event Sequence — {selected.n_events} events
          </h2>
          {selected.events.map((ev, idx) => {
            const cfg = getTypeConfig(ev.type)
            const isFirst = idx === 0
            const isLast  = idx === selected.events.length - 1
            return (
              <div key={idx} className="flex gap-4 group">
                {/* Connector */}
                <div className="flex flex-col items-center w-8 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-sm ring-2 ring-white"
                       style={{ background: isFirst ? '#2E3192' : isLast ? '#1A1A2E' : cfg.color }}>
                    {isFirst ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z"/>
                      </svg>
                    ) : isLast ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    ) : (
                      <span className="text-white text-xs font-bold">{idx}</span>
                    )}
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-0.5" style={{ minHeight: '20px' }} />}
                </div>

                {/* Card */}
                <div className={`flex-1 mb-2 rounded-xl border p-3 ${isFirst || isLast ? 'shadow-sm' : ''}`}
                     style={{ background: isFirst ? '#EEF0FF' : isLast ? '#F0FFF4' : 'white',
                              borderColor: isFirst ? '#c7cbf4' : isLast ? '#9ae6b4' : '#f3f4f6' }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-500 font-medium truncate max-w-xs">{ev.operator}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0">{ev.timestamp}</span>
                  </div>
                  {ev.note && ev.note !== ev.description && (
                    <p className="text-xs text-gray-600 mt-1.5 leading-snug line-clamp-2">{ev.note}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: '#FFF9E6', border: '1px solid #FFD100' }}>
          <p className="font-semibold text-gray-800">
            💡 นี่คือ 1 Ticket จากทั้งหมด 6,665 — ทุก Ticket มีความซับซ้อนแบบนี้
          </p>
          <p className="text-gray-600 text-xs mt-1">
            AI Copilot จะช่วยให้ Engineer กรอก Cause Category และ Resolution ได้ถูกต้องตั้งแต่แรก
            ลด Hand-off และเวลา MTTR ได้ทันที
          </p>
        </div>
      </div>
    </div>
  )
}
