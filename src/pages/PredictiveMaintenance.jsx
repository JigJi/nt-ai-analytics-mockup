import { useState } from 'react'
import { motion } from 'framer-motion'

const GAUGE_LEN = Math.PI * 50  // semi-circle radius 50 → ≈ 157.08

const SUMMARY_CARDS = [
  { label: 'Assets at Risk',     value: '1,094',  icon: '🏗️', sub: 'จาก 6,665 Tickets'           },
  { label: 'High Risk',          value: '16.41%', icon: '📊', sub: 'ของทรัพย์สินทั้งหมด'          },
  { label: 'Warning Signals',    value: '19,527', icon: '⚠️', sub: 'AI ตรวจพบจาก 186,184 Log'    },
  { label: 'SLA Recovery (Est.)',value: '+22%',   icon: '📈', sub: 'หากดำเนินการป้องกันก่อนเกิดเหตุ' },
]

const WATCHTOWER = [
  {
    asset_id: '3020009963',
    risk_score: 98,
    status: 'Critical',
    failure_history: 9,
    last_warning: 'ตรวจพบคำว่า "สายเปราะ/เสื่อม" ใน Resolution Log 4 ครั้งล่าสุด',
    prediction: 'มีโอกาสขัดข้องถาวรภายใน 72 ชั่วโมง',
  },
  {
    asset_id: 'WTV775430',
    risk_score: 92,
    status: 'High Risk',
    failure_history: 8,
    last_warning: 'พบประวัติ "สัตว์กัดสาย" ในโซน MTTR สูง (49.7 ชม.)',
    prediction: 'ต้องการการหุ้มเกราะสาย (Armoring) เร่งด่วน',
  },
  {
    asset_id: '3050001493',
    risk_score: 89,
    status: 'Warning',
    failure_history: 8,
    last_warning: 'ค่าสัญญาณเริ่มไม่เสถียร (High Loss) ต่อเนื่อง 5 วัน',
    prediction: 'คาดการณ์อุปกรณ์พอร์ตเสีย (Port Failure)',
  },
]

const RISK_DISTRIBUTION = [
  { cause: 'Repeated Technical Failure',  weight: 45, color: '#ef4444' },
  { cause: 'External Environmental Risk', weight: 35, color: '#f97316' },
  { cause: 'Aging Infrastructure',        weight: 20, color: '#f59e0b' },
]

const KEYWORDS = [
  { text: 'เสื่อมสภาพ', count: 5420 },
  { text: 'ชำรุด',      count: 4890 },
  { text: 'กระรอกกัด',  count: 3210 },
  { text: 'มดทำรัง',    count: 1200 },
]

function riskColor(score) {
  if (score >= 90) return '#ef4444'
  if (score >= 70) return '#f97316'
  return '#f59e0b'
}

function statusStyle(status) {
  if (status === 'Critical')  return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' }
  if (status === 'High Risk') return { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' }
  return                             { bg: '#fefce8', border: '#fef08a', text: '#ca8a04' }
}

function RiskGauge({ score }) {
  const color   = riskColor(score)
  const dash    = (score / 100) * GAUGE_LEN
  return (
    <svg viewBox="0 0 120 68" className="w-28 shrink-0">
      <path d="M 10 60 A 50 50 0 0 1 110 60"
        fill="none" stroke="#f1f5f9" strokeWidth={10} strokeLinecap="round" />
      <path d="M 10 60 A 50 50 0 0 1 110 60"
        fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={`${dash} ${GAUGE_LEN}`} />
      <text x="60" y="57" textAnchor="middle" fontSize="17" fontWeight="bold" fill={color}>{score}</text>
      <text x="60" y="67" textAnchor="middle" fontSize="7"  fill="#94a3b8">/ 100</text>
    </svg>
  )
}

export default function PredictiveMaintenance() {
  const [generated, setGenerated] = useState({})

  return (
    <div className="p-6 space-y-6 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Maintenance</h1>
          <p className="text-gray-500 text-sm mt-0.5">AI Risk Scoring · ระบบพยากรณ์ความเสี่ยงของโครงข่าย</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ background: '#ef4444' }}>
          ⚠️ 1,094 Assets at Risk
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {SUMMARY_CARDS.map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <span className="text-2xl">{k.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{k.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{k.value}</p>
              <p className="text-xs text-gray-400 mt-1 leading-tight">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Watchtower */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">🔭 High Risk Watchtower</h2>
          <p className="text-xs text-gray-400 mb-4">อุปกรณ์ที่ AI คาดว่ามีความเสี่ยงสูงสุด · Hover เพื่อดู Prediction</p>
          <div className="space-y-3">
            {WATCHTOWER.map(asset => {
              const color   = riskColor(asset.risk_score)
              const st      = statusStyle(asset.status)
              const isCrit  = asset.risk_score >= 90
              const done    = generated[asset.asset_id]

              return (
                <div key={asset.asset_id} className="relative rounded-xl p-4 overflow-hidden"
                     style={{ background: st.bg, border: `1px solid ${st.border}` }}>

                  {/* Pulse border for Critical / High Risk */}
                  {isCrit && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ border: `2px solid ${color}` }}
                      animate={{ opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}

                  <div className="flex items-center gap-4">
                    <RiskGauge score={asset.risk_score} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 font-mono text-sm">{asset.asset_id}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: color + '22', color }}>
                          {asset.status}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">เสีย {asset.failure_history} ครั้ง</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{asset.last_warning}</p>
                      <p className="text-xs font-semibold mt-1" style={{ color }}>→ {asset.prediction}</p>
                    </div>

                    <div className="shrink-0 ml-2">
                      {done ? (
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                          ✓ Created
                        </span>
                      ) : (
                        <button
                          onClick={() => setGenerated(p => ({ ...p, [asset.asset_id]: true }))}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap transition-opacity hover:opacity-80"
                          style={{ background: color }}
                        >
                          + Gen Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Risk Distribution */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Failure Risk Distribution</h2>
            <p className="text-xs text-gray-400 mb-4">สัดส่วนสาเหตุหลักที่ทำให้อุปกรณ์มีความเสี่ยง</p>
            <div className="space-y-4">
              {RISK_DISTRIBUTION.map(d => (
                <div key={d.cause}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600">{d.cause}</span>
                    <span className="text-sm font-bold" style={{ color: d.color }}>{d.weight}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: d.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${d.weight}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">1,094 assets · 16.41% ของระบบทั้งหมด</p>
          </div>

          {/* AI Signal Monitor */}
          <div className="bg-white rounded-2xl shadow-sm p-5 flex-1">
            <h2 className="font-semibold text-gray-800 mb-1">AI Signal Monitor</h2>
            <p className="text-xs text-gray-400 mb-4">Keywords ที่ AI ตรวจพบว่าเป็นสัญญาณเตือนจาก Log</p>
            <div className="flex flex-wrap gap-2">
              {KEYWORDS.map(k => {
                const sizeRem = 0.72 + (k.count / 5420) * 0.46
                return (
                  <div key={k.text}
                       className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
                       style={{
                         fontSize: `${sizeRem}rem`,
                         background: '#fef2f2',
                         border: '1px solid #fecaca',
                         color: '#dc2626',
                       }}>
                    <span style={{ fontSize: '0.75rem' }}>⚠️</span>
                    <span className="font-semibold">{k.text}</span>
                    <span className="font-mono" style={{ fontSize: '0.68rem', color: '#f87171' }}>
                      {k.count.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-4">รวม 19,527 warning signals ที่ตรวจพบล่วงหน้า</p>
          </div>

        </div>
      </div>
    </div>
  )
}
