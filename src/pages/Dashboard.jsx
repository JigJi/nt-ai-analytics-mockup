import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import data from '../mockup_data.json'

const { summary, cause_pie, mttr_by_cause, complexity_chart, group_chart } = data

const PIE_COLORS = ['#2E3192', '#D69E2E', '#9CA3AF', '#E53E3E', '#38A169', '#805AD5', '#0EA5E9']
const GROUP_COLORS = ['#2E3192', '#E53E3E', '#D69E2E', '#805AD5']

const KPI_CARDS = [
  {
    label: 'Total Events',
    value: '186,184',
    sub: 'Log entries across all tickets',
    icon: '📊',
  },
  {
    label: 'Total Tickets',
    value: '6,665',
    sub: 'Incidents in Oct 2025',
    icon: '🎫',
  },
  {
    label: 'Avg Event / Ticket',
    value: '28',
    sub: 'Events per incident (median 25)',
    icon: '🔄',
  },
  {
    label: 'Avg MTTR',
    value: `${summary.mttr_mean_hr}h`,
    sub: `Median ${summary.mttr_median_hr}h · Fiber avg 34.7h`,
    icon: '⏱️',
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
      <div className="grid grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => (
          <div key={k.label}
               className="rounded-2xl p-5 shadow-sm flex items-start gap-4 bg-white text-gray-800">
            <span className="text-2xl">{k.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {k.label}
              </p>
              <p className="text-2xl font-bold mt-0.5 text-gray-900">
                {k.value}
              </p>
              <p className="text-xs mt-1 leading-tight text-gray-400">
                {k.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Group Cards */}
        <div className="flex flex-col gap-3 h-full">
          {group_chart.map((d, i) => (
            <div key={d.name} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-3 flex-1">
              <span className="px-2 py-0.5 rounded text-white text-xs font-bold shrink-0"
                    style={{ background: GROUP_COLORS[i] }}>
                {d.name}
              </span>
              <span className="text-xs text-gray-500 flex-1 leading-tight">{d.desc}</span>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{d.pct}%</p>
                <p className="text-[11px] text-gray-400">{d.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
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
          <p className="text-xs text-gray-400 mb-4">ชั่วโมงเฉลี่ยจนปิด Ticket · External/Accidents ใช้เวลานานสุด 49.7h</p>
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
          <p className="text-xs text-gray-400 mt-2 text-center">75.9% ของ Ticket มี 16–35 events (Standard Operation)</p>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-2xl p-5 space-y-3 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">Key Insights <span className="text-xs font-normal text-gray-400">(วิเคราะห์ด้วย AI)</span></h2>
          {[
            {
              icon: '🚩',
              title: 'วิกฤต SLA จากปัจจัยภายนอก',
              desc: 'กลุ่มอุบัติเหตุและสัตว์กัดสายมี MTTR สูงถึง 49.7h นานกว่าปัญหาไฟฟ้าถึง 10 เท่า จำเป็นต้องมีมาตรการป้องกันเชิงรุก',
            },
            {
              icon: '🐭',
              title: 'สัตว์กัดสายคือแผลที่ซ่อนอยู่',
              desc: '10.2% ของใบงาน (681 เคส) เกิดจากสัตว์กัดสาย เดิมถูกจัดรวมใน "อื่นๆ" ทำให้มองไม่เห็นต้นทุนแฝง',
            },
            {
              icon: '🗑️',
              title: 'ปัญหาคุณภาพการบันทึกข้อมูล',
              desc: '61.6% ของ Log เป็นข้อมูลที่ไม่สามารถนำไปวิเคราะห์ต่อได้ แม้ลงข้อมูลเฉลี่ย 28 ครั้ง/ใบงาน',
            },
            {
              icon: '⚡',
              title: 'Extreme Outliers 22 เคส',
              desc: 'พบใบงานที่มีการโต้ตอบเกิน 100 ครั้ง (สูงสุด 144 ครั้ง) กินทรัพยากรสูงสุด จำเป็นต้องใช้ AI ช่วยสรุป',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3 bg-gray-50 rounded-xl p-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div>
                <p className="text-gray-800 text-sm font-semibold leading-tight">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-tight">{desc}</p>
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
