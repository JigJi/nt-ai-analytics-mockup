import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import data from '../mockup_data.json'

const { summary, cause_pie, mttr_by_cause, complexity_chart } = data

const PIE_COLORS = ['#2E3192', '#FFD100', '#E53E3E', '#38A169', '#D69E2E', '#805AD5']

const KPI_CARDS = [
  {
    label: 'Total Events',
    value: '186,184',
    sub: 'Log entries across all tickets',
    icon: '📊',
    accent: true,
  },
  {
    label: 'Unique Tickets',
    value: '6,665',
    sub: 'Incidents in Oct 2025',
    icon: '🎫',
    accent: false,
  },
  {
    label: 'Avg Updates / Ticket',
    value: '28',
    sub: 'Events per incident (median 25)',
    icon: '🔄',
    accent: false,
  },
  {
    label: 'Avg MTTR',
    value: `${summary.mttr_mean_hr}h`,
    sub: `Median ${summary.mttr_median_hr}h · Fiber avg 34.7h`,
    icon: '⏱️',
    accent: false,
  },
  {
    label: 'Avg Reassignments',
    value: summary.avg_reassign,
    sub: 'Hand-offs per ticket',
    icon: '🔀',
    accent: false,
  },
  {
    label: 'Quality Flags',
    value: `${summary.flagged_tickets.toLocaleString()}`,
    sub: `${((summary.flagged_tickets / summary.total_tickets) * 100).toFixed(0)}% of tickets flagged by AI`,
    icon: '🚩',
    accent: false,
  },
]

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, pct }) => {
  if (pct < 4) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {pct}%
    </text>
  )
}

const MttrTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800">{d.cause}</p>
      <p className="text-nt-blue font-bold text-lg">{d.avg_hr}h avg</p>
      <p className="text-gray-500">{d.count.toLocaleString()} tickets</p>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">The Findings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Process Mining บน 186,184 Event Logs · ตุลาคม 2025</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: '#2E3192' }}>
          Live Data
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {KPI_CARDS.map((k) => (
          <div key={k.label}
               className={`rounded-2xl p-5 shadow-sm flex items-start gap-4 ${
                 k.accent ? 'text-white' : 'bg-white text-gray-800'
               }`}
               style={k.accent ? { background: '#2E3192' } : {}}>
            <span className="text-2xl">{k.icon}</span>
            <div className="min-w-0">
              <p className={`text-xs font-medium uppercase tracking-wide ${k.accent ? 'text-white/60' : 'text-gray-400'}`}>
                {k.label}
              </p>
              <p className={`text-2xl font-bold mt-0.5 ${k.accent ? 'text-nt-yellow' : 'text-gray-900'}`}
                 style={k.accent ? { color: '#FFD100' } : {}}>
                {k.value}
              </p>
              <p className={`text-xs mt-1 leading-tight ${k.accent ? 'text-white/50' : 'text-gray-400'}`}>
                {k.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cause Pie */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Root Cause Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">สัดส่วนประเภทสาเหตุจาก 6,665 Tickets</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={cause_pie}
                  cx="50%" cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {cause_pie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {cause_pie.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-gray-600 flex-1 leading-tight">{d.name}</span>
                  <span className="text-xs font-semibold text-gray-800">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MTTR by Cause */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">MTTR by Root Cause</h2>
          <p className="text-xs text-gray-400 mb-4">ชั่วโมงเฉลี่ยจนปิด Ticket · Fiber/Equipment ใช้เวลานานสุด</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mttr_by_cause} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                     label={{ value: 'ชั่วโมง (hr)', position: 'insideRight', fontSize: 10, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="cause" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
              <Tooltip content={<MttrTooltip />} />
              <Bar dataKey="avg_hr" radius={[0, 6, 6, 0]}>
                {mttr_by_cause.map((d, i) => (
                  <Cell key={i}
                        fill={d.avg_hr > 30 ? '#E53E3E' : d.avg_hr > 20 ? '#D69E2E' : '#38A169'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-end">
            {[['#E53E3E','>30h Critical'],['#D69E2E','20-30h Warning'],['#38A169','<20h OK']].map(([c,l])=>(
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
                <span className="text-xs text-gray-500">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complexity + Insight row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Complexity dist */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Ticket Complexity Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">จำนวน Events ต่อ 1 Ticket — ยิ่งมาก ยิ่งซับซ้อน</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={complexity_chart} margin={{ top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`${v.toLocaleString()} tickets`]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#2E3192">
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center">73.4% ของ Ticket มี 21–50 events</p>
        </div>

        {/* Key Insights */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: '#2E3192' }}>
          <h2 className="font-semibold text-white mb-2">Key Insights จากข้อมูล</h2>
          {[
            {
              icon: '⚠️',
              title: 'Fiber Optic ใช้เวลา 34.7h เฉลี่ย',
              desc: 'นานกว่า Power Outage ถึง 2.4 เท่า ทั้งที่เป็นปัญหาซ้ำๆ',
            },
            {
              icon: '📋',
              title: '103 Template Resolutions ที่ซ้ำกัน',
              desc: 'Operator copy-paste ข้อความปิดงาน — AI ตรวจจับได้ทันที',
            },
            {
              icon: '🔄',
              title: 'Reassignment เฉลี่ย 2.48 ครั้ง/Ticket',
              desc: 'งานวนเวียน ไม่ได้ถูก assign ให้ผู้เชี่ยวชาญตั้งแต่แรก',
            },
            {
              icon: '🚩',
              title: '2,342 Tickets ถูก AI Flag',
              desc: 'มีข้อมูลไม่สอดคล้อง หรือ Resolution ไม่สมเหตุสมผล',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3 bg-white/10 rounded-xl p-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">{title}</p>
                <p className="text-white/60 text-xs mt-0.5 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Cause Paths Table */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Top Root Cause Paths</h2>
        <p className="text-xs text-gray-400 mb-4">สาเหตุที่พบมากที่สุด เรียงจากจำนวน Events (ไม่ใช่ Tickets)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-2 font-medium">Root Cause Path</th>
                <th className="pb-2 font-medium text-right">Events</th>
                <th className="pb-2 font-medium text-right">สัดส่วน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ['NC → Accidents → Other (weapon, animal)', 21195, '#E53E3E'],
                ['NT → Last Mile → Fiber Optic Cable', 20736, '#2E3192'],
                ['NT → Network → Fiber Optic Cable', 20470, '#2E3192'],
                ['CU → Power System → Power Outage', 17359, '#D69E2E'],
                ['NC → Other cause → Cannot be specified', 10543, '#9CA3AF'],
                ['NT → Last Mile → AC Power Line Facility', 8368, '#D69E2E'],
                ['NC → Accidents → Car Accidents', 5634, '#E53E3E'],
              ].map(([cause, count, color]) => (
                <tr key={cause} className="hover:bg-gray-50">
                  <td className="py-2.5 text-gray-700 font-mono text-xs">{cause}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-800">
                    {count.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right w-32">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${count/212*100}%`, background: color }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {(count/186184*100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
