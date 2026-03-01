import { useState } from 'react'

const GROUPS = [
  { id: 'normal',         title: 'Normal / Standard Cases',    count: 3120, description: 'ปิดงานตาม SLA มีขั้นตอนครบถ้วน',               color: 'green',  severity: 'None'   },
  { id: 'data_quality',   title: 'Data Quality Issues',        count: 1117, description: "ระบุสาเหตุ 'อื่นๆ' ทั้งที่มี Keyword ชัดเจนใน Note", color: 'red',    severity: 'High'   },
  { id: 'silent_closure', title: 'Suspicious Silent Closure',  count:  950, description: 'ปิดงานเร็วผิดปกติ ขาดรูปภาพหรือผลเทสประกอบ',     color: 'yellow', severity: 'Medium' },
  { id: 'recurring',      title: 'Recurring Faults',           count:  820, description: 'แจ้งเสียซ้ำจุดเดิมภายใน 1 สัปดาห์',              color: 'purple', severity: 'High'   },
  { id: 'problematic',    title: 'High Risk Interaction',      count:  418, description: 'โต้ตอบสูงหรือลัดคิวบ่อย เสี่ยง Complaint',       color: 'orange', severity: 'Medium' },
  { id: 'tech_noise',     title: 'Technical Noise',            count:  240, description: 'ปัญหาอุปกรณ์ลูกค้า ไม่เกี่ยวโครงข่ายหลัก',       color: 'slate',  severity: 'Low'    },
]

const TOTAL_MONITORED = 6665

const COLOR_CONFIG = {
  red:    { border: '#FEB2B2', bg: '#FFF5F5', text: '#C53030' },
  purple: { border: '#D6BCFA', bg: '#FAF5FF', text: '#6B46C1' },
  orange: { border: '#FBD38D', bg: '#FFFAF0', text: '#C05621' },
  yellow: { border: '#F6E05E', bg: '#FFFFF0', text: '#975A16' },
  slate:  { border: '#CBD5E0', bg: '#F7FAFC', text: '#4A5568' },
  green:  { border: '#9AE6B4', bg: '#F0FFF4', text: '#276749' },
}

const SEVERITY_CONFIG = {
  High:   { color: '#C53030', bg: '#FFF5F5' },
  Medium: { color: '#C05621', bg: '#FFFAF0' },
  Low:    { color: '#4A5568', bg: '#F7FAFC' },
  None:   { color: '#276749', bg: '#F0FFF4' },
}

const TICKET_LIST = [
  // normal
  { id: 'SD25174355', group: 'normal',         open: '2025-10-23', close: '2025-10-23', cause: 'NT --> Last Mile --> MH01:Router/ONT',         note: 'ลงพื้นที่เปลี่ยน Patch Cord สำเร็จ ปิดงานตาม SLA' },
  { id: 'SD25168012', group: 'normal',         open: '2025-10-05', close: '2025-10-05', cause: 'CU --> Power System --> SuP:Power Outage',      note: 'ไฟฟ้า กฟภ. คืนดี วงจรกลับมาปกติ' },
  { id: 'SD25171340', group: 'normal',         open: '2025-10-14', close: '2025-10-15', cause: 'NT --> Last Mile --> LE13:Router',              note: 'Reboot Router สำเร็จ ทดสอบ Ping ผ่านทุก Endpoint' },
  { id: 'SD25176102', group: 'normal',         open: '2025-10-29', close: '2025-10-29', cause: 'NT --> Last Mile --> LL06:Fiber Optic Cable',   note: 'เชื่อมต่อสาย F/O ใหม่ ยิงแสงผ่าน ปิดงานเรียบร้อย' },
  // data_quality
  { id: 'SD25169250', group: 'data_quality',   open: '2025-10-08', close: '2025-10-09', cause: 'NC --> Other Cause --> NoO:อื่นๆ',             note: 'Note ระบุ "สายขาด" แต่ Cause เลือก อื่นๆ ไม่ตรง' },
  { id: 'SD25172910', group: 'data_quality',   open: '2025-10-18', close: '2025-10-19', cause: 'NC --> Other Cause --> NoO:อื่นๆ',             note: 'Log มี Keyword "ไฟดับ" แต่ Cause ไม่ตรงกับ Power Outage' },
  { id: 'SD25175300', group: 'data_quality',   open: '2025-10-27', close: '2025-10-28', cause: 'NC --> Other Cause --> NoO:อื่นๆ',             note: 'บันทึก "Router แฮงค์" แต่ Cause Category ไม่ระบุอุปกรณ์' },
  { id: 'SD25173020', group: 'data_quality',   open: '2025-10-19', close: '2025-10-20', cause: 'NC --> Other Cause --> NoO:อื่นๆ',             note: 'ช่างระบุสายขาดชัดเจน แต่ผู้บันทึกเลือก Cause ผิดประเภท' },
  // silent_closure
  { id: 'SD25168859', group: 'silent_closure', open: '2025-10-07', close: '2025-10-07', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'ปิดงานใน 0.4h ไม่มีรูปถ่ายหรือผลยืนยันจากลูกค้า' },
  { id: 'SD25174009', group: 'silent_closure', open: '2025-10-22', close: '2025-10-22', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'ปิดงาน 0.3h ไม่มี Confirmation ขาดขั้นตอน Verification' },
  { id: 'SD25172986', group: 'silent_closure', open: '2025-10-19', close: '2025-10-19', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'ระยะเวลา 0.8h ไม่มีผลเทสหรือหลักฐานแนบประกอบ' },
  { id: 'SD25174004', group: 'silent_closure', open: '2025-10-22', close: '2025-10-22', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'ปิดงานเร็วผิดปกติ ขาดขั้นตอน Sign-off จากลูกค้า' },
  // recurring
  { id: 'SD25169377', group: 'recurring',      open: '2025-10-09', close: '2025-10-09', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'พื้นที่เดิม แจ้งซ้ำครั้งที่ 3 ภายในสัปดาห์เดียวกัน' },
  { id: 'SD25169381', group: 'recurring',      open: '2025-10-09', close: '2025-10-10', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'ONU เดิมแจ้งซ้ำภายใน 5 วัน เสี่ยงอุปกรณ์เสื่อม' },
  { id: 'SD25170979', group: 'recurring',      open: '2025-10-14', close: '2025-10-14', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'ลูกค้ารายเดิม Ticket ที่ 2 ในรอบ 7 วัน' },
  { id: 'SD25169403', group: 'recurring',      open: '2025-10-09', close: '2025-10-09', cause: 'CU --> Power System --> SuP:Power Outage',     note: 'จุดเดิมแจ้งซ้ำ ควรเสนอเปลี่ยนอุปกรณ์ถาวร' },
  // problematic
  { id: 'SD25185285', group: 'problematic',    open: '2025-10-28', close: '2025-11-04', cause: 'NT --> Last Mile --> LE13:Router',              note: 'ตามงานครั้งที่ 7 อุปกรณ์แฮงค์ซ้ำจากความร้อน' },
  { id: 'SD25175665', group: 'problematic',    open: '2025-10-27', close: '2025-11-14', cause: 'NT --> Last Mile --> LL06:Fiber Optic Cable',   note: 'Reassign 5 ครั้ง ไม่สามารถระบุจุดขาดได้ชัดเจน' },
  { id: 'SD25175719', group: 'problematic',    open: '2025-10-27', close: '2025-10-31', cause: 'NT --> Last Mile --> LL06:Fiber Optic Cable',   note: 'ส่งงานวนระหว่าง Tier 2–3 เกิน 8 ครั้ง ลูกค้า Escalate' },
  { id: 'SD25167770', group: 'problematic',    open: '2025-10-04', close: '2025-10-05', cause: 'CU --> Line --> SuL:In house wiring',           note: 'โต้ตอบ 26 ครั้ง ลูกค้าร้องเรียนความล่าช้า' },
  // tech_noise
  { id: 'SD25169151', group: 'tech_noise',     open: '2025-10-08', close: '2025-10-08', cause: 'NC --> Accidents --> NoA:Other accidents',      note: 'ลูกค้ายืนยันปัญหาจาก Router ส่วนตัวเสียเอง ไม่ใช่โครงข่าย' },
  { id: 'SD25174663', group: 'tech_noise',     open: '2025-10-24', close: '2025-10-24', cause: 'Partner --> Last Mile --> PLL01:Bad Contact',   note: 'สายภายในบ้านลูกค้าชำรุด ไม่เกี่ยวกับโครงข่ายหลัก' },
  { id: 'SD25169408', group: 'tech_noise',     open: '2025-10-09', close: '2025-10-09', cause: 'CU --> Line --> SuL:In house wiring',           note: 'อุปกรณ์ ONU ลูกค้าเสียเอง ไม่พบปัญหาจาก NT' },
  { id: 'SD25174658', group: 'tech_noise',     open: '2025-10-24', close: '2025-10-24', cause: 'Partner --> Last Mile --> PLL01:Bad Contact',   note: 'ไฟฟ้า กฟภ. ขัดข้อง ไม่ใช่ความรับผิดชอบโครงข่าย NT' },
]

export default function AIAuditMonitor() {
  const [selectedGroup, setSelectedGroup] = useState(null)

  const filtered = selectedGroup
    ? TICKET_LIST.filter(t => t.group === selectedGroup)
    : TICKET_LIST

  const toggleGroup = (id) => setSelectedGroup(prev => prev === id ? null : id)

  return (
    <div className="flex flex-col h-full fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900">AI Audit Monitor</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            AI ตรวจพบและจัดกลุ่ม Ticket ผิดปกติ — คลิกการ์ดเพื่อ Filter ตาราง
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: '#2E3192' }}>{TOTAL_MONITORED.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Total Monitored</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Summary Cards */}
        <div className="px-6 pt-5 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Issue Groups</p>
          <div className="grid grid-cols-3 gap-3">
            {GROUPS.map(g => {
              const cfg = COLOR_CONFIG[g.color]
              const sev = SEVERITY_CONFIG[g.severity]
              const isSelected = selectedGroup === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGroup(g.id)}
                  className="text-left rounded-2xl border-2 p-4 transition-all hover:shadow-md active:scale-95"
                  style={{
                    background:  isSelected ? cfg.bg   : 'white',
                    borderColor: isSelected ? cfg.text  : cfg.border,
                    outline:     isSelected ? `3px solid ${cfg.border}` : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-3xl font-bold leading-none" style={{ color: cfg.text }}>
                      {g.count.toLocaleString()}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 mt-0.5"
                          style={{ background: sev.bg, color: sev.color }}>
                      {g.severity}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">{g.title}</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-gray-500 leading-snug">{g.description}</p>
                    <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: cfg.text }}>
                      {(g.count / TOTAL_MONITORED * 100).toFixed(1)}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        <div className="px-6 py-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Ticket List
                </p>
                {selectedGroup ? (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: COLOR_CONFIG[GROUPS.find(g => g.id === selectedGroup)?.color]?.bg,
                            color:      COLOR_CONFIG[GROUPS.find(g => g.id === selectedGroup)?.color]?.text,
                          }}>
                      {GROUPS.find(g => g.id === selectedGroup)?.title}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">ทั้งหมด</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{filtered.length} tickets</span>
                {selectedGroup && (
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    ล้าง Filter ×
                  </button>
                )}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Interaction ID</th>
                  <th className="px-4 py-3 font-medium">Group</th>
                  <th className="px-4 py-3 font-medium">Open Date</th>
                  <th className="px-4 py-3 font-medium">Close Date</th>
                  <th className="px-4 py-3 font-medium">Cause Category</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(t => {
                  const g   = GROUPS.find(x => x.id === t.group)
                  const cfg = g ? COLOR_CONFIG[g.color] : COLOR_CONFIG.slate
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-gray-800">{t.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        {g && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                style={{ background: cfg.bg, color: cfg.text }}>
                            {g.title}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{t.open}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{t.close}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600 max-w-xs">
                        <p className="truncate">{t.cause}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                        <p className="truncate">{t.note}</p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                ไม่มี Ticket ในกลุ่มนี้
              </div>
            )}

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              แสดง {filtered.length} tickets {selectedGroup ? `ในกลุ่ม "${GROUPS.find(g => g.id === selectedGroup)?.title}"` : `จากทั้งหมด ${TICKET_LIST.length} ตัวอย่าง`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
