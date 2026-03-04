import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ───────────── Data ───────────── */
const TIER_DATA = [
  {
    id: 'T1',
    name: 'Tier 1: Call Center',
    shortName: 'Call Center',
    icon: '📞',
    status: 'Healthy',
    statusColor: '#10b981',
    statusBg: '#064e3b',
    metrics: { events: 12450, avgTime: '0.5h', quality: 85 },
    aiInsight: 'ข้อมูลนำเข้ามีคุณภาพดี แต่พบการเปิด Ticket ซ้ำซ้อน (Duplicate) ในกลุ่ม Power Outage สูงถึง 15%',
    aiRecommendations: [
      'ติดตั้งระบบตรวจจับ Duplicate Ticket อัตโนมัติก่อนเปิดใบงาน',
      'เพิ่ม Auto-suggest สาเหตุจาก Historical Data เมื่อรับสาย',
      'ฝึกอบรม Agent ให้ Cross-check ข้อมูลพื้นที่ก่อนเปิดเคสใหม่',
    ],
  },
  {
    id: 'T2',
    name: 'Tier 2: Dispatcher',
    shortName: 'Dispatcher',
    icon: '🎯',
    status: 'Bottleneck',
    statusColor: '#ef4444',
    statusBg: '#7f1d1d',
    metrics: { events: 28650, avgTime: '4.5h', quality: 40 },
    aiInsight: 'เป็นจุดคอขวดหลัก งานค้างรอจ่ายงานนานเกินมาตรฐาน โดยเฉพาะในเคส External / Accidents',
    aiRecommendations: [
      'ใช้ AI Auto-dispatch จัดสรรงานตามพื้นที่และความเชี่ยวชาญของช่าง',
      'ตั้ง SLA Alert เมื่อ Ticket ค้างเกิน 2 ชั่วโมง',
      'เพิ่มกำลังคน Dispatcher ในช่วง Peak Hours (08:00-10:00)',
    ],
  },
  {
    id: 'T3',
    name: 'Tier 3: Field Engineer',
    shortName: 'Field Engineer',
    icon: '🔧',
    status: 'Critical',
    statusColor: '#f97316',
    statusBg: '#7c2d12',
    metrics: { events: 112450, avgTime: '13.8 - 49.7h', quality: 25 },
    aiInsight: 'พบ Junk Log สูงถึง 61.6% และมี MTTR สูงผิดปกติในเคสสัตว์กัดสาย แนะนำให้อบรมการลงข้อมูลหน้างาน',
    aiRecommendations: [
      'บังคับใช้ Template Resolution Log ที่มีเนื้อหาครบถ้วน',
      'ติดตั้ง Mobile App สำหรับลงข้อมูลหน้างานแบบ Guided Form',
      'หุ้มเกราะสายในโซนเสี่ยงสัตว์กัดเพื่อลด MTTR กลุ่มนี้',
    ],
  },
  {
    id: 'T4',
    name: 'Tier 4: QC / Admin',
    shortName: 'QC / Admin',
    icon: '✅',
    status: 'Stable',
    statusColor: '#3b82f6',
    statusBg: '#1e3a5f',
    metrics: { events: 32634, avgTime: '2.1h', quality: 92 },
    aiInsight: 'พบการตีกลับงาน (Ping-pong) ไปยัง Tier 3 สูงในเคสที่ข้อมูลไม่สมบูรณ์',
    aiRecommendations: [
      'สร้าง Checklist อัตโนมัติตรวจสอบความสมบูรณ์ของข้อมูลก่อนส่ง QC',
      'ใช้ AI ช่วยตรวจจับ Log ที่ไม่สมบูรณ์แล้วส่งกลับทันที',
      'ลด Ping-pong โดยเพิ่ม Inline Feedback ไปยัง Field Engineer',
    ],
  },
]

const CATEGORIES = ['All', 'Fiber', 'Power', 'External']
const AREAS = ['All Areas', 'ภาคเหนือ', 'ภาคกลาง', 'ภาคตะวันออกเฉียงเหนือ', 'ภาคใต้']

/* ───────────── Helpers ───────────── */
function qualityColor(pct) {
  if (pct >= 80) return '#10b981'
  if (pct >= 50) return '#eab308'
  if (pct >= 35) return '#f97316'
  return '#ef4444'
}

function qualityLabel(pct) {
  if (pct >= 80) return 'Good'
  if (pct >= 50) return 'Fair'
  if (pct >= 35) return 'Poor'
  return 'Critical'
}

function formatNumber(n) {
  return n.toLocaleString()
}

/* ───────────── Sub-components ───────────── */

function FilterBar({ category, setCategory, area, setArea }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Category */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category</span>
        <div className="flex bg-gray-800 rounded-lg p-0.5">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                category === c
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Period</span>
        <div className="bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 font-mono flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Oct 2025
        </div>
      </div>

      {/* Area */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Area</span>
        <select
          value={area}
          onChange={e => setArea(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500 cursor-pointer"
        >
          {AREAS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Ticket count */}
      <div className="ml-auto flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-gray-400">
          Monitoring <span className="text-white font-bold">6,665</span> tickets
        </span>
      </div>
    </div>
  )
}

function TierRibbon({ tiers, activeTier, setActiveTier }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {tiers.map((tier, i) => {
        const isActive = activeTier === tier.id
        return (
          <motion.button
            key={tier.id}
            onClick={() => setActiveTier(tier.id)}
            className={`relative rounded-xl p-4 text-left transition-all border-2 ${
              isActive
                ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                : 'border-gray-700/50 hover:border-gray-600'
            }`}
            style={{
              background: isActive ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#111827',
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                style={{ background: tier.statusColor }}
                layoutId="tierIndicator"
              />
            )}

            {/* Tier flow number */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{tier.icon}</span>
                <span className="text-xs font-mono text-gray-500">{tier.id}</span>
              </div>
              {/* Status badge */}
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: tier.statusBg, color: tier.statusColor }}
              >
                {tier.status}
              </span>
            </div>

            <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
              {tier.shortName}
            </p>

            {/* Mini metrics */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] text-gray-500">
                {formatNumber(tier.metrics.events)} events
              </span>
              <span className="text-[11px] font-mono" style={{ color: tier.statusColor }}>
                {tier.metrics.avgTime}
              </span>
            </div>

            {/* Flow connector arrow */}
            {i < tiers.length - 1 && (
              <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-gray-600">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3L10 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

function StatusCards({ tier }) {
  const qColor = qualityColor(tier.metrics.quality)
  const qLabel = qualityLabel(tier.metrics.quality)

  const cards = [
    {
      label: 'Total Events',
      value: formatNumber(tier.metrics.events),
      sub: 'กิจกรรมที่ Tier นี้ดำเนินการ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: '#3b82f6',
    },
    {
      label: 'Avg. Process Time',
      value: tier.metrics.avgTime,
      sub: 'เวลาเฉลี่ยที่งานค้างที่ Tier นี้',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: tier.statusColor,
    },
    {
      label: 'Data Integrity Score',
      value: `${tier.metrics.quality}%`,
      sub: `คุณภาพ Log: ${qLabel}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: qColor,
      hasBar: true,
      barPct: tier.metrics.quality,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(card => (
        <motion.div
          key={card.label}
          className="rounded-xl p-5 border border-gray-700/50"
          style={{ background: '#111827' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</span>
            <span style={{ color: card.color }}>{card.icon}</span>
          </div>
          <motion.p
            className="text-3xl font-bold font-mono"
            style={{ color: card.color }}
            key={card.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {card.value}
          </motion.p>
          <p className="text-xs text-gray-500 mt-1">{card.sub}</p>

          {card.hasBar && (
            <div className="mt-3">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: card.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${card.barPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-600">0%</span>
                <span className="text-[10px] font-mono" style={{ color: card.color }}>{card.barPct}%</span>
                <span className="text-[10px] text-gray-600">100%</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function AIInsightPanel({ tier }) {
  return (
    <motion.div
      className="rounded-xl border border-gray-700/50 overflow-hidden"
      style={{ background: '#111827' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-700/50 flex items-center gap-2"
           style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #111827 100%)' }}>
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
        <span className="text-sm font-semibold text-violet-300">AI Insight & Recommendation</span>
        <span className="text-[10px] text-gray-500 font-mono ml-auto">Powered by AI Analysis</span>
      </div>

      <div className="p-5 grid grid-cols-2 gap-6">
        {/* Insight */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Analysis</span>
          </div>
          <div className="rounded-lg p-4 border border-gray-700/50" style={{ background: '#0f172a' }}>
            <p className="text-sm text-gray-300 leading-relaxed">{tier.aiInsight}</p>
          </div>

          {/* Status summary */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: tier.statusBg }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: tier.statusColor }} />
              <span className="text-[11px] font-semibold" style={{ color: tier.statusColor }}>{tier.status}</span>
            </div>
            <span className="text-[11px] text-gray-500">{tier.name}</span>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Recommendations</span>
          </div>
          <div className="space-y-2">
            {tier.aiRecommendations.map((rec, i) => (
              <motion.div
                key={i}
                className="flex gap-3 items-start rounded-lg p-3 border border-gray-700/30"
                style={{ background: '#0f172a' }}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
              >
                <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-300 leading-snug">{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────────── Main Component ───────────── */
export default function OperationalFlowAudit() {
  const [activeTier, setActiveTier] = useState('T1')
  const [category, setCategory] = useState('All')
  const [area, setArea] = useState('All Areas')

  const currentTier = TIER_DATA.find(t => t.id === activeTier)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1a' }}>
      <div className="p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Unit Operational Flow Audit</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-500/30">
                Monitor
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              ภาพรวมการดำเนินงานแต่ละหน่วยงาน · Network Operations Center
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-300 font-mono">LIVE</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Last Updated</p>
              <p className="text-xs text-gray-400 font-mono">Oct 2025</p>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="rounded-xl p-4 border border-gray-700/50" style={{ background: '#111827' }}>
          <FilterBar category={category} setCategory={setCategory} area={area} setArea={setArea} />
        </div>

        {/* ── Tier Ribbon ── */}
        <TierRibbon tiers={TIER_DATA} activeTier={activeTier} setActiveTier={setActiveTier} />

        {/* ── Status Cards ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTier}>
            <StatusCards tier={currentTier} />
          </motion.div>
        </AnimatePresence>

        {/* ── AI Insight & Recommendation ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTier}>
            <AIInsightPanel tier={currentTier} />
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
