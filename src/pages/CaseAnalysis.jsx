import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THAILAND_PROVINCES, PROVINCE_TO_REGION } from '../data/thailandMapData'

/* ───────────── Data ───────────── */
const CASE_META = {
  selectedPath: 'NC --> 8:Accidents --> NoA:Other accidents : weapon, animal',
  totalInCategory: 1118,
  aiReclassifiedCount: 703,
  impactRank: 'Critical (High MTTR)',
}

const DEEP_DIVE = [
  { id: 'animal', label: 'Animal Attacks', icon: '🐀', count: 681, avgMttr: '49.7h', trend: 'Increasing in Rural Zones', trendDir: 'up', color: '#ea580c' },
  { id: 'weapon', label: 'Weapon Incidents', icon: '🔫', count: 22, avgMttr: '48.2h', trend: 'Stable', trendDir: 'stable', color: '#dc2626' },
  { id: 'other', label: 'Unidentified Other', icon: '❓', count: 415, avgMttr: '15.4h', trend: 'Decreasing due to AI Audit', trendDir: 'down', color: '#2563eb' },
]

const PROVINCE_CASE_DATA = {
  'TH-50': 42, 'TH-52': 18, 'TH-54': 12, 'TH-57': 8,
  'TH-41': 38, 'TH-40': 55, 'TH-30': 31, 'TH-34': 22, 'TH-47': 15, 'TH-45': 18, 'TH-36': 10,
  'TH-10': 88, 'TH-13': 40, 'TH-12': 35, 'TH-11': 28, 'TH-14': 15, 'TH-19': 12,
  'TH-20': 22, 'TH-21': 10, 'TH-22': 6,
  'TH-70': 8, 'TH-71': 14,
  'TH-84': 72, 'TH-93': 156, 'TH-90': 85, 'TH-91': 25, 'TH-92': 30, 'TH-80': 45, 'TH-86': 18, 'TH-82': 12, 'TH-94': 20, 'TH-96': 15,
}

const REGION_CASE_SUMMARY = Object.entries(PROVINCE_CASE_DATA).reduce((acc, [pid, count]) => {
  const region = PROVINCE_TO_REGION[pid]
  if (region) acc[region] = (acc[region] || 0) + count
  return acc
}, {})

const REAL_EXAMPLES = [
  { id: 'IM250891', rawDesc: 'สายขาดกลางอากาศ', aiFinding: 'สัตว์กัดสาย (มดทำรัง)', resolution: 'เปลี่ยนสาย Dropwire 150m', lossValue: '4,500', severity: 'medium', aiIcon: '🐜' },
  { id: 'IM260112', rawDesc: 'สัญญาณล่ม ตรวจสอบไม่พบสาเหตุ', aiFinding: 'โดนลูกหลงปืนยิงเสาไฟ', resolution: 'ประสานงานตำรวจและซ่อม Core', lossValue: '12,000', severity: 'critical', aiIcon: '🔫' },
  { id: 'IM260234', rawDesc: 'สายหลุดหลายจุด ตรวจไม่พบเหตุ', aiFinding: 'กระรอกกัดสาย Fiber หลายจุด', resolution: 'เปลี่ยนสาย + หุ้มเกราะป้องกัน', lossValue: '8,200', severity: 'high', aiIcon: '🐿️' },
  { id: 'IM260301', rawDesc: 'ไฟกระพริบ สัญญาณหาย', aiFinding: 'หนูกัดสายไฟเลี้ยง ONU', resolution: 'ซ่อมสาย + ติดตั้งท่อกันสัตว์', lossValue: '3,800', severity: 'medium', aiIcon: '🐀' },
  { id: 'IM260455', rawDesc: 'Internet ใช้ไม่ได้ หลายหลังคาเรือน', aiFinding: 'กระรอกกัดสาย Feeder หลัก', resolution: 'เปลี่ยนสาย Feeder 300m + สเปรย์กันสัตว์', lossValue: '15,400', severity: 'critical', aiIcon: '🐿️' },
  { id: 'IM260510', rawDesc: 'สัญญาณหายเป็นช่วงๆ ตอนกลางคืน', aiFinding: 'ค้างคาวทำรังในตู้ ODF กัดสายภายใน', resolution: 'ทำความสะอาดตู้ + ติดตาข่ายกันสัตว์', lossValue: '2,200', severity: 'medium', aiIcon: '🦇' },
  { id: 'IM260623', rawDesc: 'สายขาด ไม่ทราบสาเหตุ จุดกลางทุ่ง', aiFinding: 'รอยกัดของสัตว์ฟันแทะ (หนูนา)', resolution: 'เปลี่ยนสายหุ้มเกราะ 200m', lossValue: '9,600', severity: 'high', aiIcon: '🐀' },
  { id: 'IM260718', rawDesc: 'เสาล้ม สายขาดหลายเส้น', aiFinding: 'รถบรรทุกชนเสา (ไม่ใช่ภัยธรรมชาติ)', resolution: 'ตั้งเสาใหม่ + เรียกค่าเสียหาย', lossValue: '45,000', severity: 'critical', aiIcon: '🚛' },
  { id: 'IM260802', rawDesc: 'ONU เสีย เปลี่ยนแล้วยังไม่ดี', aiFinding: 'งูเข้าตู้ MDB ทำให้ลัดวงจร', resolution: 'ซ่อม MDB + ติดตั้งตะแกรงกันงู', lossValue: '6,800', severity: 'high', aiIcon: '🐍' },
  { id: 'IM260899', rawDesc: 'ลูกค้าแจ้งเน็ตช้า สายไม่ขาด', aiFinding: 'นกทำรังบน Closure กดสายโค้งงอ (Macro-bend loss)', resolution: 'รื้อรัง + จัดสายใหม่ใน Closure', lossValue: '1,500', severity: 'medium', aiIcon: '🐦' },
]

const AI_DIAGNOSTIC = {
  rootCause: 'จากเคสทั้งหมด 6,665 ใบ AI พบว่า 681 เคส (10.2%) ถูกจัดหมวดหมู่ผิดเป็น "Other" ทั้งที่สาเหตุจริงคือสัตว์กัดสายและอาวุธ ส่งผลให้ดับสะสม 33,845 ชม. เกิดจุดเสียซ้ำ 1,094 จุด และสร้างความเสียหายรวมประมาณ ฿4.25M',
  hiddenPatterns: [
    { label: 'กระรอกกัดสาย', pct: 41.3, count: 281, icon: '🐿️', color: '#ea580c', downtime: '14,207 ชม.', riskPts: '412 จุด', loss: '฿1.48M' },
    { label: 'หนู/สัตว์ฟันแทะ', pct: 32.5, count: 221, icon: '🐀', color: '#d97706', downtime: '10,984 ชม.', riskPts: '318 จุด', loss: '฿1.08M' },
    { label: 'งู/สัตว์เลื้อยคลาน', pct: 10.6, count: 72, icon: '🐍', color: '#7c3aed', downtime: '3,528 ชม.', riskPts: '105 จุด', loss: '฿0.38M' },
    { label: 'นก/ค้างคาว/แมลง', pct: 12.3, count: 85, icon: '🦇', color: '#0891b2', downtime: '4,066 ชม.', riskPts: '137 จุด', loss: '฿0.45M' },
    { label: 'อาวุธ/ปืนยิง', pct: 3.2, count: 22, icon: '🔫', color: '#dc2626', downtime: '1,060 ชม.', riskPts: '22 จุด', loss: '฿0.26M' },
  ],
  impactMetrics: [
    { label: 'MTTR สัตว์กัดสาย', value: '49.7 ชม.', baseline: '19.1 ชม.', multiplier: '2.6x', status: 'critical' },
    { label: 'Repeat Failure Rate', value: '34.2%', baseline: '8.5%', multiplier: '4.0x', status: 'critical' },
    { label: 'SLA Breach (เคสสัตว์)', value: '68%', baseline: '22%', multiplier: '3.1x', status: 'danger' },
    { label: 'Misclassification Rate', value: '61.6%', baseline: '< 5%', multiplier: '12.3x', status: 'warning' },
  ],
  recommendations: [
    { priority: 'Critical', action: 'Targeted Cable Armoring', details: 'เปลี่ยนสายหุ้มเกราะ (Armored Cable) ในพื้นที่ Hotspot 156 จุดใน Phatthalung Zone ที่เกิดเหตุซ้ำซาก คาดลดเคสซ้ำ 72%', icon: '🛡️', impact: 'ลดเคสซ้ำ 72%', timeline: '3 เดือน', cost: '฿1.2M' },
    { priority: 'High', action: 'Smart Dispatch Routing', details: 'ปรับ Workflow ให้ข้าม Tier 2 (Dispatcher) และส่งงานตรงถึงทีมช่างสายทันทีเมื่อ AI ตรวจพบ Keyword สัตว์กัดสาย เพื่อลดเวลาลง 4.5 ชม.', icon: '⚡', impact: 'ลด MTTR 4.5 ชม.', timeline: '2 สัปดาห์', cost: '฿0' },
    { priority: 'Medium', action: 'Law Enforcement Liaison', details: 'ประสานงานเจ้าหน้าที่ตำรวจในจุดเสี่ยงอาวุธ 3 โซน พร้อมติดตั้ง CCTV เฝ้าระวังเสาที่ถูกยิงซ้ำ', icon: '👮', impact: 'ลดเคสอาวุธ 60%', timeline: '1 เดือน', cost: '฿350K' },
    { priority: 'Medium', action: 'Smart Dispatch Routing', details: 'ปรับ Workflow ให้ข้าม Tier 2 (Dispatcher) และส่งงานตรงถึงทีมช่างสายทันทีเมื่อ AI ตรวจพบ Keyword สัตว์กัดสาย เพื่อลดเวลาลง 4.5 ชม.', icon: '🔄', impact: 'ลด MTTR 4.5 ชม.', timeline: '2 สัปดาห์', cost: '฿0' },
    { priority: 'Low', action: 'Field Log Quality Up-skill', details: 'บังคับใช้ Mobile AI ตรวจจับรูปภาพหน้างานแทนการพิมพ์ Log เพื่อลดปริมาณขยะข้อมูล 61.6%', icon: '📱', impact: 'ลด Misclass 90%', timeline: '2 เดือน', cost: '฿180K' },
  ],
  projectedSavings: {
    repairCost: { before: '฿4.25M', after: '฿1.18M', saved: '฿3.07M' },
    mttr: { before: '49.7 ชม.', after: '18.2 ชม.', reduction: '63%' },
    slaBreach: { before: '68%', after: '15%', reduction: '78%' },
    repeatRate: { before: '34.2%', after: '8.1%', reduction: '76%' },
  },
}

const FILTER_PATHS = [
  'NC --> 8:Accidents --> NoA:Other accidents : weapon, animal',
  'NT --> 2:Last Mile --> 5:Line (Last Mile) --> LL06:Fiber Optic Cable',
  'CU --> 5:Power System --> SuP:Power Outage',
  'NT --> 1:Network --> 1:Line (Network) --> NL05:Fiber Optic Cable',
  'NC --> 13:Other cause --> NoO:Can not be specified',
]

/* ───────────── Helpers ───────────── */
function severityBadge(sev) {
  const map = {
    critical: { bg: '#fef2f2', color: '#dc2626', label: 'CRITICAL' },
    high: { bg: '#fffbeb', color: '#d97706', label: 'HIGH' },
    medium: { bg: '#eff6ff', color: '#2563eb', label: 'MEDIUM' },
  }
  const s = map[sev] || map.medium
  return (
    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function trendIcon(dir) {
  if (dir === 'up') return <span className="text-red-500">↑</span>
  if (dir === 'down') return <span className="text-green-500">↓</span>
  return <span className="text-gray-400">→</span>
}

/* Heat color for white theme: white base → yellow → orange → red */
function heatColor(value, maxVal) {
  if (value == null || value === 0) return '#f1f5f9'
  const t = Math.min(value / maxVal, 1)
  if (t < 0.12) return '#fef9c3'
  if (t < 0.25) return '#fef08a'
  if (t < 0.4) return '#fde047'
  if (t < 0.55) return '#fbbf24'
  if (t < 0.7) return '#f97316'
  if (t < 0.85) return '#ea580c'
  return '#dc2626'
}

const LEGEND_STEPS = [
  { color: '#f1f5f9' }, { color: '#fef9c3' }, { color: '#fde047' },
  { color: '#fbbf24' }, { color: '#f97316' }, { color: '#ea580c' }, { color: '#dc2626' },
]

/* ───────────── Sub-components ───────────── */

function FilterBar({ selectedPath, setSelectedPath }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Case Path</span>
          <div className="relative">
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-800 transition-all min-w-[560px] justify-between"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="font-mono text-xs">{selectedPath}</span>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Backdrop to close on outside click */}
            {open && (
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            )}

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                >
                  {FILTER_PATHS.map(p => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPath(p); setOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-mono flex items-center gap-2 transition-colors ${
                        selectedPath === p
                          ? 'bg-red-50 text-red-700 border-l-2 border-red-500 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                      }`}
                    >
                      <svg className={`w-3.5 h-3.5 ${selectedPath === p ? 'text-red-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {p}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{CASE_META.impactRank}</span>
        </div>
      </div>
    </div>
  )
}

const TOP_CARDS = [
  { label: 'สัตว์กัดสาย (AI Revealed)', value: '681 เคส', trend: '+10.2% of total', status: 'critical' },
  { label: 'SLA Impact (MTTR)', value: '49.7 ชม.', trend: '2.6x avg speed', status: 'warning' },
  { label: 'เวลารวมที่ดับสะสม', value: '33,845 ชม.', trend: 'SLA Leakage', status: 'danger' },
  { label: 'จุดเสี่ยงเสียซ้ำซาก', value: '1,094 จุด', trend: 'Need Protection', status: 'action' },
  { label: 'ประมาณการความเสียหายรวม', value: '฿4.25M', trend: 'Repair + SLA Penalty', status: 'financial' },
]

const STATUS_STYLE = {
  critical: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: '🐀' },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', icon: '⏱️' },
  danger: { bg: '#fff1f2', border: '#fecdd3', color: '#e11d48', icon: '⚡' },
  action: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', icon: '📍' },
  financial: { bg: '#faf5ff', border: '#e9d5ff', color: '#7c3aed', icon: '💰' },
}

function MetaCards() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {TOP_CARDS.map((card, i) => {
        const s = STATUS_STYLE[card.status] || STATUS_STYLE.critical
        return (
          <motion.div
            key={card.label}
            className="rounded-xl p-4 shadow-sm"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: s.border, color: s.color }}>
                {card.status}
              </span>
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{card.value}</p>
            <p className="text-[11px] text-gray-600 mt-1 font-medium">{card.label}</p>
            <p className="text-[10px] mt-1 font-medium" style={{ color: s.color }}>{card.trend}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

function HeatMapPanel() {
  const [hovered, setHovered] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const maxVal = useMemo(() => Math.max(...Object.values(PROVINCE_CASE_DATA)), [])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({ x: e.clientX - rect.left + 14, y: e.clientY - rect.top - 8 })
  }

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full flex flex-col"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-sm font-semibold text-gray-800">Threat Heat Map</span>
      </div>

      {/* Map — flex-1 grows to match table height, SVG centered inside */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-50/50 min-h-0 p-2" onMouseMove={handleMouseMove}>
        <svg
          viewBox="-20 -25 589 1059"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', maxWidth: 220 }}
        >
          {THAILAND_PROVINCES.map((province) => {
            const cases = PROVINCE_CASE_DATA[province.id] || 0
            const fill = heatColor(cases, maxVal)
            const isHovered = hovered === province.id
            return (
              <path
                key={province.id}
                d={province.d}
                fill={isHovered ? '#3b82f6' : fill}
                stroke={isHovered ? '#1d4ed8' : '#cbd5e1'}
                strokeWidth={isHovered ? '2' : '0.5'}
                style={{ cursor: 'pointer', transition: 'fill 0.2s, stroke-width 0.15s' }}
                onMouseEnter={() => setHovered(province.id)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (() => {
          const prov = THAILAND_PROVINCES.find(p => p.id === hovered)
          if (!prov) return null
          const cases = PROVINCE_CASE_DATA[hovered] || 0
          const region = PROVINCE_TO_REGION[hovered]
          return (
            <div
              className="absolute pointer-events-none z-50 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg"
              style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translateY(-100%)' }}
            >
              <p className="text-xs font-semibold text-gray-800">{prov.title}</p>
              <p className="text-[10px] text-gray-400">{region}</p>
              {cases > 0
                ? <p className="text-xs font-mono font-bold text-red-600 mt-0.5">{cases} cases</p>
                : <p className="text-[10px] text-gray-400 mt-0.5">No cases</p>
              }
            </div>
          )
        })()}
      </div>

      {/* Legend + Region summary */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="mb-3">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Case Frequency</p>
          <div className="flex gap-px">
            {LEGEND_STEPS.map((step, i) => (
              <div key={i} className="flex-1 h-2.5 first:rounded-l last:rounded-r" style={{ background: step.color }} />
            ))}
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[8px] text-gray-400">0</span>
            <span className="text-[8px] text-gray-400">150+</span>
          </div>
        </div>

        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Cases by Region</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(REGION_CASE_SUMMARY).sort((a, b) => b[1] - a[1]).map(([region, total]) => (
            <div key={region} className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">{region}</span>
              <span className="text-[11px] font-mono font-bold text-gray-700">{total}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function AuditTable() {
  const totalLoss = REAL_EXAMPLES.reduce((s, r) => s + parseInt(r.lossValue.replace(/,/g, '')), 0)

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="text-sm font-semibold text-gray-800">The Audit Table</span>
        <span className="text-[10px] text-gray-400 ml-1">— Raw Data vs AI Discovery</span>
        <span className="text-[10px] text-gray-400 font-mono ml-auto">{REAL_EXAMPLES.length} cases</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Raw (ช่าง)</th>
              <th className="px-3 py-2 font-medium">AI Finding</th>
              <th className="px-3 py-2 font-medium">Resolution</th>
              <th className="px-3 py-2 font-medium text-right">Loss</th>
              <th className="px-3 py-2 font-medium text-center">Sev.</th>
            </tr>
          </thead>
          <tbody>
            {REAL_EXAMPLES.map((row, i) => (
              <motion.tr
                key={row.id}
                className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <td className="px-3 py-2.5">
                  <span className="text-[11px] font-mono font-bold text-blue-600">{row.id}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[11px] text-gray-500 leading-snug">{row.rawDesc}</span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm shrink-0">{row.aiIcon}</span>
                    <span className="text-[11px] text-emerald-700 leading-snug font-medium">{row.aiFinding}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[11px] text-gray-500 leading-snug">{row.resolution}</span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="text-[11px] font-mono font-bold text-amber-600">{row.lossValue}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {severityBadge(row.severity)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <span className="text-[10px] text-gray-400">AI-verified anomaly cases</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Total Loss:</span>
          <span className="text-xs font-mono font-bold text-amber-600">{totalLoss.toLocaleString()} THB</span>
        </div>
      </div>
    </motion.div>
  )
}

const PRIORITY_STYLE = {
  Critical: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', dot: '#dc2626' },
  High: { bg: '#fff7ed', border: '#fed7aa', color: '#ea580c', dot: '#ea580c' },
  Medium: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', dot: '#d97706' },
  Low: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', dot: '#16a34a' },
}

function AIBrainPanel() {
  const savings = AI_DIAGNOSTIC.projectedSavings
  return (
    <div className="space-y-4">
      {/* Header banner */}
      <motion.div
        className="rounded-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-base">The Brain — AI Root Cause Intelligence</h2>
              <p className="text-violet-300 text-xs">Deep Pattern Analysis & Strategic Action Plan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-white/10">
              <span className="text-[10px] text-violet-200 font-mono">Confidence: </span>
              <span className="text-sm text-white font-bold font-mono">94.7%</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
              <span className="text-[10px] text-emerald-300 font-mono">Model v3.2</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 1: What Happened + Impact Metrics */}
      <div className="grid grid-cols-12 gap-4">
        {/* What Happened */}
        <motion.div
          className="col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 420 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">1</span>
            <span className="text-sm font-bold text-gray-800">What Happened — Root Cause Breakdown</span>
          </div>
          <div className="p-5 overflow-y-auto flex-1 min-h-0">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{AI_DIAGNOSTIC.rootCause}</p>

            {/* Breakdown cards */}
            <div className="space-y-3">
              {AI_DIAGNOSTIC.hiddenPatterns.map((p, i) => (
                <motion.div
                  key={i}
                  className="rounded-lg border p-3"
                  style={{ background: `${p.color}06`, borderColor: `${p.color}20` }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.icon}</span>
                      <span className="text-xs font-semibold text-gray-700">{p.label}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: p.color }}>{p.count} เคส</span>
                      <span className="text-[10px] text-gray-400">({p.pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2.5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: p.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400">Downtime:</span>
                      <span className="text-[11px] font-mono font-bold text-gray-700">{p.downtime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400">จุดเสี่ยง:</span>
                      <span className="text-[11px] font-mono font-bold text-gray-700">{p.riskPts}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400">Loss:</span>
                      <span className="text-[11px] font-mono font-bold" style={{ color: p.color }}>{p.loss}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Impact Metrics */}
        <motion.div
          className="col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">2</span>
            <span className="text-sm font-bold text-gray-800">Why It Matters — Impact Score</span>
          </div>
          <div className="p-4 space-y-3">
            {AI_DIAGNOSTIC.impactMetrics.map((m, i) => {
              const statusColor = m.status === 'critical' ? '#dc2626' : m.status === 'danger' ? '#e11d48' : '#d97706'
              return (
                <motion.div
                  key={i}
                  className="rounded-lg p-3 border"
                  style={{ background: `${statusColor}08`, borderColor: `${statusColor}20` }}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-600 font-medium">{m.label}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono text-white" style={{ background: statusColor }}>
                      {m.multiplier}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-lg font-bold font-mono" style={{ color: statusColor }}>{m.value}</span>
                    <span className="text-[10px] text-gray-400 mb-0.5">vs baseline {m.baseline}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Strategic Recommendations */}
      <motion.div
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">3</span>
          <span className="text-sm font-bold text-gray-800">How to Fix — Strategic Action Plan</span>
          <span className="text-[10px] text-gray-400 ml-auto font-mono">{AI_DIAGNOSTIC.recommendations.length} actions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-2.5 font-medium w-24">Priority</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Details</th>
                <th className="px-4 py-2.5 font-medium text-center w-32">Impact</th>
                <th className="px-4 py-2.5 font-medium text-center w-24">Timeline</th>
                <th className="px-4 py-2.5 font-medium text-right w-24">Cost</th>
              </tr>
            </thead>
            <tbody>
              {AI_DIAGNOSTIC.recommendations.map((rec, i) => {
                const ps = PRIORITY_STYLE[rec.priority] || PRIORITY_STYLE.Medium
                return (
                  <motion.tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ps.dot }} />
                        {rec.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{rec.icon}</span>
                        <span className="text-[12px] font-semibold text-gray-800">{rec.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-gray-500 leading-snug">{rec.details}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[11px] font-mono font-bold text-emerald-600">{rec.impact}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[11px] font-mono text-gray-500">{rec.timeline}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[11px] font-mono font-bold text-gray-700">{rec.cost}</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Row 3: Projected Savings */}
      <motion.div
        className="rounded-xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-sm font-bold text-white">Projected Savings — If All Actions Implemented</span>
          <span className="text-[10px] text-emerald-300 font-mono ml-auto">ROI Projection</span>
        </div>
        <div className="p-5 grid grid-cols-4 gap-4">
          {[
            { label: 'Repair Cost', icon: '💰', before: savings.repairCost.before, after: savings.repairCost.after, saved: savings.repairCost.saved, unit: '' },
            { label: 'MTTR', icon: '⏱️', before: savings.mttr.before, after: savings.mttr.after, saved: savings.mttr.reduction, unit: '' },
            { label: 'SLA Breach Rate', icon: '📉', before: savings.slaBreach.before, after: savings.slaBreach.after, saved: savings.slaBreach.reduction, unit: '' },
            { label: 'Repeat Failure', icon: '🔁', before: savings.repeatRate.before, after: savings.repeatRate.after, saved: savings.repeatRate.reduction, unit: '' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="rounded-xl p-4 bg-white/10 backdrop-blur border border-white/10"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{item.icon}</span>
                <span className="text-[11px] text-emerald-200 font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-white/40 font-mono line-through">{item.before}</span>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-sm text-white font-bold font-mono">{item.after}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-400/20 border border-emerald-400/30 inline-block">
                <span className="text-xs text-emerald-300 font-bold font-mono">{item.saved}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

/* ───────────── Main Component ───────────── */
export default function CaseAnalysis() {
  const [selectedPath, setSelectedPath] = useState('NC --> 8:Accidents --> NoA:Other accidents : weapon, animal')

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Case Analysis</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                AI Deep Dive
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              เจาะลึกเคสที่ AI ตรวจพบความผิดปกติ · Threat Intelligence
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Selected Path</p>
            <p className="text-xs text-red-600 font-mono font-semibold">{selectedPath}</p>
          </div>
        </div>

        <FilterBar selectedPath={selectedPath} setSelectedPath={setSelectedPath} />
        <MetaCards />

        {/* Heat Map + Audit Table — stretch to same height */}
        <div className="grid grid-cols-12 gap-4 items-stretch">
          <div className="col-span-4 flex">
            <HeatMapPanel />
          </div>
          <div className="col-span-8">
            <AuditTable />
          </div>
        </div>

        <AIBrainPanel />
      </div>
    </div>
  )
}
