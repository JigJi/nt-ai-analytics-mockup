import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Filter, Brain, TrendingUp } from 'lucide-react'

const TIERS = [
  {
    id: 'tier_1',
    name: 'Tier 1',
    subtitle: 'Data Ingestion',
    Icon: Database,
    description: 'รวบรวม Log ทั้งหมดจากระบบ e-Ticket',
    stats: '186,184',
    statsUnit: 'บรรทัด',
    details: 'นำเข้าข้อมูลจาก 6 ช่วงเวลา รวมใบงาน 6,665 ใบ',
    color: '#94a3b8',
  },
  {
    id: 'tier_2',
    name: 'Tier 2',
    subtitle: 'Noise Reduction',
    Icon: Filter,
    description: 'คัดกรอง Log ไร้ความหมาย (Junk Detection)',
    stats: '-61.6%',
    statsUnit: 'Noise Removed',
    details: 'ตรวจพบ 114,690 บรรทัดที่เป็นขยะ (เช่น \'.\', \'ok\', \'-\') และกำจัดออกจากการวิเคราะห์',
    color: '#ef4444',
  },
  {
    id: 'tier_3',
    name: 'Tier 3',
    subtitle: 'Semantic Mapping',
    Icon: Brain,
    description: 'วิเคราะห์บริบทและจัดกลุ่มใหม่ด้วย AI',
    stats: '7',
    statsUnit: 'Core Categories',
    details: 'เปลี่ยนจากกลุ่ม \'Other\' (42.7%) ให้กลายเป็น \'สัตว์กัดสาย\' (681 เคส) และ \'อุบัติเหตุ\' โดยอัตโนมัติ',
    color: '#3b82f6',
  },
  {
    id: 'tier_4',
    name: 'Tier 4',
    subtitle: 'BI Intelligence',
    Icon: TrendingUp,
    description: 'คำนวณดัชนีชี้วัดทางธุรกิจ (MTTR & SLA)',
    stats: 'Actionable',
    statsUnit: 'Insights',
    details: 'คำนวณเวลาซ่อมเฉลี่ยรายกลุ่ม (เช่น External นานสุด 49.7 ชม.) เพื่อส่งต่อให้ผู้บริหารสั่งการ',
    color: '#10b981',
  },
]

const BEFORE_DATA = [
  { id: 'SD25174355', note: '.',    resolution: 'ปิดงาน',              cause: 'อื่นๆ' },
  { id: 'SD25167850', note: 'ok',   resolution: '-',                   cause: 'อื่นๆ' },
  { id: 'SD25173894', note: '-',    resolution: 'ok',                  cause: '?'    },
  { id: 'SD25169383', note: '.',    resolution: 'ไฟฟ้าดับ///วงจรคืนดี', cause: 'อื่นๆ' },
]

const AFTER_DATA = [
  { id: 'SD25174355', cause: 'NT → Last Mile → Fiber Optic', mttr: '2.5h',  status: 'ok'      },
  { id: 'SD25167850', cause: 'NT → Facility → UPS System',  mttr: '8.7h',  status: 'ok'      },
  { id: 'SD25173894', cause: 'NT → Network → Fiber Optic',  mttr: '54.9h', status: 'outlier' },
  { id: 'SD25169383', cause: 'CU → Power System → Outage',  mttr: '1.5h',  status: 'flagged' },
]

function Particle({ color, delay }) {
  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 8px ${color}`, left: 0 }}
      animate={{ left: ['-8px', '110%'], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2, delay, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function Connector({ color }) {
  return (
    <div className="relative flex items-center mx-2" style={{ width: 60, height: 2, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <Particle key={i} color={color} delay={i * 0.65} />
      ))}
    </div>
  )
}

export default function AITransformationFlow() {
  const [hoveredTier, setHoveredTier] = useState(null)

  return (
    <div className="min-h-screen p-6 space-y-5" style={{ background: '#0f172a' }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-green-400 text-xs font-mono tracking-widest uppercase">System Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Transformation Flow</h1>
          <p className="text-slate-400 text-sm mt-0.5">กระบวนการแปลงข้อมูลดิบเป็น Business Intelligence ด้วย AI</p>
        </div>
        <div className="flex gap-6">
          {[
            { label: 'Raw Events',      value: '186,184' },
            { label: 'Unique Tickets',  value: '6,665'   },
            { label: 'Processed',       value: '2026-03-02' },
          ].map(({ label, value }) => (
            <div key={label} className="text-right">
              <p className="text-slate-500 text-xs">{label}</p>
              <p className="text-white font-bold font-mono text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Flow */}
      <div className="rounded-2xl p-6" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-6 font-mono">Data Processing Pipeline</p>
        <div className="flex items-stretch">
          {TIERS.map((tier, i) => (
            <div key={tier.id} className="flex items-center" style={{ flex: '1 1 0', minWidth: 0 }}>
              <motion.div
                className="rounded-xl p-4 cursor-default w-full h-full"
                style={{
                  background: hoveredTier === tier.id ? `${tier.color}12` : '#0f172a',
                  border: `1px solid ${hoveredTier === tier.id ? tier.color : 'rgba(255,255,255,0.06)'}`,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                whileHover={{ y: -4 }}
                onHoverStart={() => setHoveredTier(tier.id)}
                onHoverEnd={() => setHoveredTier(null)}
                transition={{ duration: 0.2 }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                     style={{ background: `${tier.color}20` }}>
                  <tier.Icon size={18} style={{ color: tier.color }} />
                </div>

                {/* Labels */}
                <p className="text-xs font-mono mb-0.5" style={{ color: tier.color }}>{tier.name}</p>
                <p className="text-white text-sm font-semibold leading-tight">{tier.subtitle}</p>

                {/* Stats */}
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-white text-xl font-bold font-mono leading-none">{tier.stats}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{tier.statsUnit}</p>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{tier.description}</p>

                {/* Details on hover */}
                <AnimatePresence>
                  {hoveredTier === tier.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${tier.color}30` }}>
                        <p className="text-xs leading-relaxed" style={{ color: tier.color }}>{tier.details}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Connector */}
              {i < TIERS.length - 1 && (
                <Connector color={TIERS[i + 1].color} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Transformation Preview */}
      <div className="rounded-2xl p-6" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3 mb-5">
          <p className="text-white font-semibold">Data Transformation Preview</p>
          <span className="px-2 py-0.5 rounded text-xs font-mono"
                style={{ background: '#10b98118', color: '#10b981', border: '1px solid #10b98130' }}>
            AI Processed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* BEFORE */}
          <div className="rounded-xl p-4" style={{ background: '#0f172a', border: '1px solid #ef444430' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-red-400 text-xs font-mono uppercase tracking-widest">Before — Raw Log</p>
            </div>
            <div className="space-y-2.5">
              {BEFORE_DATA.map((row) => (
                <div key={row.id} className="grid font-mono text-xs gap-2 pb-2.5"
                     style={{ gridTemplateColumns: '7rem 1fr 1fr auto', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-slate-500">{row.id}</span>
                  <span className="text-red-400/50 truncate">{row.note}</span>
                  <span className="text-red-400/50 truncate">{row.resolution}</span>
                  <span className="text-slate-600">{row.cause}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-3 font-mono italic">// ข้อมูลไม่สมบูรณ์ ไม่สามารถวิเคราะห์ต่อได้</p>
          </div>

          {/* AFTER */}
          <div className="rounded-xl p-4" style={{ background: '#0f172a', border: '1px solid #10b98130' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-green-400 text-xs font-mono uppercase tracking-widest">After — AI Classified</p>
            </div>
            <div className="space-y-2.5">
              {AFTER_DATA.map((row) => (
                <div key={row.id} className="grid font-mono text-xs gap-2 items-center pb-2.5"
                     style={{ gridTemplateColumns: '7rem 1fr auto auto', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-slate-400">{row.id}</span>
                  <span className="text-green-300/70 truncate">{row.cause}</span>
                  <span className="text-blue-400 text-right">{row.mttr}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] text-center"
                        style={{
                          background: row.status === 'outlier' ? '#eab30820' : row.status === 'flagged' ? '#ef444420' : '#10b98120',
                          color:      row.status === 'outlier' ? '#eab308'   : row.status === 'flagged' ? '#ef4444'   : '#10b981',
                        }}>
                    {row.status === 'outlier' ? '⚡ Outlier' : row.status === 'flagged' ? '🚩 Flagged' : '✓ OK'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-green-600 text-xs mt-3 font-mono italic">// จัดกลุ่ม · คำนวณ MTTR · ตรวจสอบ Flag โดยอัตโนมัติ</p>
          </div>
        </div>
      </div>

    </div>
  )
}
