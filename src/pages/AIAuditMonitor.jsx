import { useState } from 'react'
import data from '../mockup_data.json'

const { audit_tickets, summary } = data

const FLAG_CONFIG = {
  'Template Resolution':  { color: '#D69E2E', bg: '#FFFBEB', icon: '📋' },
  'Resolution Too Short': { color: '#E53E3E', bg: '#FFF5F5', icon: '⚡' },
  'Missing Cause':        { color: '#805AD5', bg: '#FAF5FF', icon: '❓' },
}

function flagConfig(flag) {
  for (const [key, cfg] of Object.entries(FLAG_CONFIG)) {
    if (flag.startsWith(key)) return { ...cfg, label: flag }
  }
  // Topic Mismatch
  if (flag.startsWith('Topic Mismatch')) {
    return { color: '#E53E3E', bg: '#FFF5F5', icon: '🔀', label: flag }
  }
  return { color: '#6B7280', bg: '#F9FAFB', icon: '⚠️', label: flag }
}

const ALL_FLAG_TYPES = ['ทั้งหมด', 'Template Resolution', 'Resolution Too Short', 'Missing Cause', 'Topic Mismatch']

export default function AIAuditMonitor() {
  const [filter, setFilter] = useState('ทั้งหมด')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [sortBy, setSortBy] = useState('flag_count')

  const filtered = audit_tickets
    .filter(t => {
      if (filter === 'ทั้งหมด') return true
      return t.flags.some(f => f.startsWith(filter))
    })
    .sort((a, b) => {
      if (sortBy === 'flag_count') return b.flag_count - a.flag_count
      if (sortBy === 'duration')   return b.duration_hr - a.duration_hr
      if (sortBy === 'events')     return b.n_events - a.n_events
      return 0
    })

  const flagTypeCounts = {}
  audit_tickets.forEach(t => t.flags.forEach(f => {
    const key = ALL_FLAG_TYPES.find(k => k !== 'ทั้งหมด' && f.startsWith(k)) || f
    flagTypeCounts[key] = (flagTypeCounts[key] || 0) + 1
  }))

  return (
    <div className="flex flex-col h-full fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Audit Monitor</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              AI ตรวจพบ Ticket ที่มีข้อมูลไม่สมบูรณ์หรือผิดปกติจาก 186,184 events
            </p>
          </div>
          {/* Summary pills */}
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl border border-red-100 bg-red-50">
              <p className="text-xl font-bold text-red-600">{summary.flagged_tickets.toLocaleString()}</p>
              <p className="text-xs text-red-500">Tickets Flagged</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl border border-yellow-100 bg-yellow-50">
              <p className="text-xl font-bold text-yellow-600">{summary.template_res_patterns}</p>
              <p className="text-xs text-yellow-500">Template Patterns</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl border border-purple-100 bg-purple-50">
              <p className="text-xl font-bold text-purple-600">{(summary.flagged_tickets/summary.total_tickets*100).toFixed(0)}%</p>
              <p className="text-xs text-purple-500">ของ Tickets ทั้งหมด</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main list area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {ALL_FLAG_TYPES.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          filter === f
                            ? 'text-white border-transparent'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                        style={filter === f ? { background: '#2E3192' } : {}}>
                  {f}
                  {f !== 'ทั้งหมด' && flagTypeCounts[f] ? ` (${flagTypeCounts[f]})` : ''}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400">เรียงตาม:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none">
                <option value="flag_count">จำนวน Flags</option>
                <option value="duration">ระยะเวลา</option>
                <option value="events">จำนวน Events</option>
              </select>
            </div>
          </div>

          {/* Flag type summary chips */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-2 flex-wrap">
            {Object.entries(FLAG_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                   style={{ background: cfg.bg, color: cfg.color }}>
                <span>{cfg.icon}</span>
                <span>{key}</span>
                <span className="font-bold">{flagTypeCounts[key] || 0} tickets</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                 style={{ background: '#FFF5F5', color: '#E53E3E' }}>
              <span>🔀</span>
              <span>Topic Mismatch</span>
              <span className="font-bold">
                {audit_tickets.filter(t => t.flags.some(f => f.startsWith('Topic Mismatch'))).length} tickets
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Ticket ID</th>
                  <th className="px-3 py-3 font-medium">เปิดเมื่อ</th>
                  <th className="px-3 py-3 font-medium">Events</th>
                  <th className="px-3 py-3 font-medium">Duration</th>
                  <th className="px-3 py-3 font-medium">AI Flags</th>
                  <th className="px-3 py-3 font-medium">Resolution (สั้น)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(t => (
                  <tr key={t.id}
                      onClick={() => setSelectedTicket(t.id === selectedTicket ? null : t.id)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                        t.id === selectedTicket ? 'bg-blue-50' : ''
                      }`}>
                    <td className="px-6 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-800">{t.id}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {t.open_time?.slice(0,10)}
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-gray-800">{t.n_events}</td>
                    <td className="px-3 py-3 text-xs">
                      <span className={`font-semibold ${t.duration_hr > 100 ? 'text-red-600' : t.duration_hr > 24 ? 'text-yellow-600' : 'text-gray-700'}`}>
                        {t.duration_hr}h
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.flags.map((f, i) => {
                          const cfg = flagConfig(f)
                          return (
                            <span key={i} className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                  style={{ background: cfg.bg, color: cfg.color }}>
                              {cfg.icon} {cfg.label.length > 20 ? cfg.label.slice(0,18)+'…' : cfg.label}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-xs">
                      <p className="truncate" title={t.resolution}>{t.resolution || '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                ไม่มี Ticket ที่ตรงกับ Filter นี้
              </div>
            )}
          </div>
          <div className="px-6 py-2 bg-white border-t border-gray-100 text-xs text-gray-400">
            แสดง {filtered.length} จาก {audit_tickets.length} Tickets ตัวอย่าง (ทั้งหมด {summary.flagged_tickets.toLocaleString()} ที่ถูก Flag)
          </div>
        </div>

        {/* Right: Ticket Detail Panel */}
        {selectedTicket && (() => {
          const t = audit_tickets.find(x => x.id === selectedTicket)
          if (!t) return null
          return (
            <div className="w-80 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto fade-in">
              <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="font-semibold text-gray-800 text-sm">Ticket Detail</p>
                <button onClick={() => setSelectedTicket(null)}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
              </div>

              <div className="p-4 space-y-4">
                {/* ID & meta */}
                <div>
                  <p className="font-mono text-sm font-bold text-gray-900 mb-2">{t.id}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['เปิดเมื่อ', t.open_time?.slice(0,16)],
                      ['Duration', `${t.duration_hr}h`],
                      ['Events', t.n_events],
                      ['Flags', t.flag_count],
                    ].map(([label, val]) => (
                      <div key={label} className="rounded-lg bg-gray-50 p-2">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-xs font-semibold text-gray-800">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flags */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Flags</p>
                  <div className="space-y-2">
                    {t.flags.map((f, i) => {
                      const cfg = flagConfig(f)
                      return (
                        <div key={i} className="rounded-xl p-3 border"
                             style={{ background: cfg.bg, borderColor: cfg.color + '33' }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span>{cfg.icon}</span>
                            <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                          </div>
                          {f === 'Template Resolution' && (
                            <p className="text-xs text-gray-600">Resolution ซ้ำกับ Ticket อื่น &gt;5 ครั้ง — อาจไม่สะท้อนข้อเท็จจริง</p>
                          )}
                          {f === 'Resolution Too Short' && (
                            <p className="text-xs text-gray-600">Resolution สั้นกว่า 10 ตัวอักษร — ไม่เพียงพอสำหรับ Audit</p>
                          )}
                          {f === 'Missing Cause' && (
                            <p className="text-xs text-gray-600">ไม่มี CAUSE_DETAIL — ทำให้วิเคราะห์แนวโน้มไม่ได้</p>
                          )}
                          {f.startsWith('Topic Mismatch') && (
                            <p className="text-xs text-gray-600">หัวข้อปัญหาเริ่มต้นไม่ตรงกับ Resolution สุดท้าย</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-1">DESCRIPTION (Initial)</p>
                  <p className="text-xs text-gray-700 leading-snug">{t.description || '—'}</p>
                </div>

                {/* Resolution */}
                <div className="rounded-xl bg-gray-50 p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">RESOLUTION (Final)</p>
                  <p className="text-xs text-gray-700 leading-snug">{t.resolution || '(ว่างเปล่า)'}</p>
                </div>

                {/* Cause */}
                <div className="rounded-xl bg-purple-50 p-3 border border-purple-100">
                  <p className="text-xs text-purple-600 font-semibold mb-1">CAUSE_DETAIL</p>
                  <p className="text-xs text-gray-700 font-mono leading-snug">{t.cause || '(ไม่ระบุ)'}</p>
                </div>

                {/* AI Recommendation */}
                <div className="rounded-xl p-3 border border-yellow-200" style={{ background: '#FFF9E6' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#B7791F' }}>AI แนะนำ</p>
                  <p className="text-xs text-gray-700 leading-snug">
                    Ticket นี้ควรถูกส่งกลับให้ Engineer เพิ่มเติมข้อมูล
                    {t.flags.includes('Template Resolution') && ' และเปลี่ยน Resolution ให้ตรงกับสถานการณ์จริง'}
                    {t.flags.includes('Missing Cause') && ' พร้อมระบุ Cause Category ให้ครบ'}
                  </p>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
