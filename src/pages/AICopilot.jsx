import { useState, useEffect, useRef } from 'react'

const SCENARIOS = [
  {
    id: 'fiber',
    label: 'สายขาด / Fiber',
    prompt: 'ลงพื้นที่ตรวจสอบ พบสายไฟเบอร์ขาดที่ปากซอย 5 รถตักดินขุดทับ เปลี่ยนสายใหม่ประมาณ 30 เมตร',
    suggestion: {
      causeCategory: 'NT --> 2:Last Mile --> 5:Line (Last Mile) --> LL06:Fiber Optic Cable',
      causeGroup:    'NC --> 8:Accidents --> NoA:Car Accidents',
      resolution:    'ลงพื้นที่ตรวจสอบพบสาย Fiber Optic ขาดเนื่องจากถูกรถตักดินขุดทับบริเวณปากซอย 5 ดำเนินการเปลี่ยนสายใหม่ระยะทาง 30 เมตร และทดสอบสัญญาณจนเป็นปกติ วงจรคืนดีเวลา [เวลา] น.',
      materials: [
        { name: 'Fiber Optic Drop Wire', qty: '30 m', code: 'FOC-DROP-30' },
        { name: 'Fiber Splice Closure', qty: '2 ชิ้น', code: 'FSC-IP68' },
        { name: 'Fiber Connector (SC/APC)', qty: '4 ชิ้น', code: 'SC-APC-SM' },
      ],
      confidence: 96,
      similarCases: 20736,
      avgMTTR: '34.7h',
      urgency: 'high',
      tips: 'ถ่ายภาพจุดที่สายขาดและยานพาหนะที่ทำให้เกิดความเสียหาย เพื่อประกอบการเรียกค่าเสียหาย',
    },
  },
  {
    id: 'power',
    label: 'ไฟฟ้าดับ / Power',
    prompt: 'ลูกค้าแจ้งสัญญาณหาย ตรวจสอบพบไฟฟ้าดับในพื้นที่ ONU ไม่มีไฟ รอไฟฟ้ากลับมา',
    suggestion: {
      causeCategory: 'CU --> 5:Power System --> SuP:Power Outage',
      causeGroup:    'NT --> 2:Last Mile --> 7:Facility(Last Mile) --> LF08:Commercial Power Outage',
      resolution:    'ตรวจสอบพบไฟฟ้า กฟภ. ขัดข้องในพื้นที่ ส่งผลให้อุปกรณ์ ONU ที่ลูกค้าไม่มีไฟฟ้า หลังจาก กฟภ. แก้ไขไฟฟ้ากลับมาเป็นปกติ อุปกรณ์ Boot ขึ้นและวงจรคืนดีโดยอัตโนมัติ',
      materials: [],
      confidence: 98,
      similarCases: 17359,
      avgMTTR: '14.6h',
      urgency: 'medium',
      tips: 'บันทึกหมายเลขโทรศัพท์ กฟภ. ในพื้นที่ และเวลาที่ไฟฟ้าคืนมาเพื่อใช้อ้างอิง Downtime',
    },
  },
  {
    id: 'router',
    label: 'Router แฮงค์',
    prompt: 'Ping ไม่ได้ ลงพื้นที่พบ Router แฮงค์ LED กะพริบผิดปกติ ทำการ Reboot แล้วกลับมาปกติ',
    suggestion: {
      causeCategory: 'NT --> 2:Last Mile --> 6:Equipment (Last Mile) --> LE13:Router',
      causeGroup:    'NT --> 2:Last Mile --> 6:Equipment (Last Mile)',
      resolution:    'ลงพื้นที่ตรวจสอบพบ Router ที่ลูกค้าค้าง (Hang) สังเกตจาก LED Status กะพริบผิดปกติ ดำเนินการ Power Cycle (Reboot) อุปกรณ์ หลังจาก Boot ขึ้นสมบูรณ์ ทดสอบ Ping ปลายทางได้ปกติ วงจรคืนดี',
      materials: [
        { name: 'Router Replacement (สำรอง)', qty: '1 เครื่อง', code: 'RTR-BACKUP' },
      ],
      confidence: 91,
      similarCases: 3325,
      avgMTTR: '35.9h',
      urgency: 'medium',
      tips: 'ตรวจสอบ Firmware Version และบันทึก Serial Number หากอุปกรณ์ค้างบ่อยกว่า 3 ครั้ง/เดือน ควรเสนอเปลี่ยนอุปกรณ์',
    },
  },
]

const URGENCY_CONFIG = {
  high:   { label: 'สูง', color: '#E53E3E', bg: '#FFF5F5' },
  medium: { label: 'ปานกลาง', color: '#D69E2E', bg: '#FFFBEB' },
  low:    { label: 'ต่ำ', color: '#38A169', bg: '#F0FFF4' },
}

function TypingText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { setDone(true); clearInterval(interval) }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])
  return (
    <span>
      {displayed}
      {!done && <span className="cursor-blink font-bold text-nt-blue">|</span>}
    </span>
  )
}

export default function AICopilot() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0])
  const [inputText, setInputText] = useState(SCENARIOS[0].prompt)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const textareaRef = useRef(null)

  const selectScenario = (scenario) => {
    setActiveScenario(scenario)
    setInputText(scenario.prompt)
    setShowSuggestion(false)
  }

  const analyze = () => {
    if (!inputText.trim()) return
    setIsAnalyzing(true)
    setShowSuggestion(false)
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowSuggestion(true)
    }, 1400)
  }

  const copyResolution = () => {
    navigator.clipboard?.writeText(activeScenario.suggestion.resolution)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const s = activeScenario.suggestion
  const urgency = URGENCY_CONFIG[s.urgency]

  return (
    <div className="flex flex-col h-full fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">AI Copilot</h1>
          <p className="text-xs text-gray-400">พิมพ์ Log ของคุณ → AI แนะนำ Cause Category, Resolution และวัสดุที่ต้องใช้</p>
        </div>
        <div className="flex gap-2">
          {SCENARIOS.map(sc => (
            <button key={sc.id} onClick={() => selectScenario(sc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sc.id === activeScenario.id
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={sc.id === activeScenario.id ? { background: '#2E3192' } : {}}>
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Engineer Input */}
        <div className="w-1/2 flex flex-col border-r border-gray-100 bg-gray-50">
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400 ml-2 font-mono">engineer_update.log</span>
            </div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Engineer Log / หมายเหตุ</p>
          </div>
          <div className="flex-1 px-5 pb-4 flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => { setInputText(e.target.value); setShowSuggestion(false) }}
              placeholder="พิมพ์ Log หรือหมายเหตุที่ช่างเขียนมา เช่น 'สายขาดปากซอย 5 รถตักดินขุดทับ...'"
              className="flex-1 w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 font-mono leading-relaxed"
              style={{ '--tw-ring-color': '#2E3192' }}
              rows={10}
            />

            <button
              onClick={analyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: '#FFD100', color: '#2E3192' }}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  AI กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  วิเคราะห์ด้วย AI
                </>
              )}
            </button>

            {/* Context hint */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700 leading-snug">
              <p className="font-semibold mb-0.5">🧠 AI ถูก Train จากข้อมูลจริง</p>
              <p className="text-blue-600">
                เรียนรู้จาก 186,184 events · {s.similarCases.toLocaleString()} เคสที่คล้ายกัน
                ใน 186k rows นี้ · ความแม่นยำ {s.confidence}%
              </p>
            </div>
          </div>
        </div>

        {/* Right: AI Suggestion */}
        <div className="w-1/2 flex flex-col bg-white overflow-y-auto">
          {!showSuggestion && !isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-gray-400">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                   style={{ background: '#EEF0FF' }}>
                <svg className="w-8 h-8" fill="none" stroke="#2E3192" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">รอรับ AI Suggestion</p>
              <p className="text-sm mt-1">พิมพ์ Log และกด "วิเคราะห์ด้วย AI"</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" style={{ borderTopColor: '#2E3192' }} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">กำลังวิเคราะห์...</p>
                <p className="text-xs text-gray-400 mt-1">เปรียบเทียบกับ {s.similarCases.toLocaleString()} เคสที่คล้ายกัน</p>
              </div>
            </div>
          )}

          {showSuggestion && (
            <div className="p-5 space-y-4 fade-in">
              {/* Confidence bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width: `${s.confidence}%`, background: '#2E3192' }} />
                </div>
                <span className="text-sm font-bold" style={{ color: '#2E3192' }}>{s.confidence}% confidence</span>
              </div>

              {/* Urgency + similar */}
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl p-3 border" style={{ background: urgency.bg, borderColor: urgency.color + '33' }}>
                  <p className="text-xs text-gray-500 mb-0.5">ระดับความเร่งด่วน</p>
                  <p className="font-semibold text-sm" style={{ color: urgency.color }}>
                    {urgency.label}
                  </p>
                </div>
                <div className="flex-1 rounded-xl p-3 border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-0.5">เคสคล้ายกันในระบบ</p>
                  <p className="font-semibold text-sm text-gray-800">{s.similarCases.toLocaleString()} เคส</p>
                </div>
                <div className="flex-1 rounded-xl p-3 border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-0.5">MTTR เฉลี่ยประเภทนี้</p>
                  <p className="font-semibold text-sm text-gray-800">{s.avgMTTR}</p>
                </div>
              </div>

              {/* Cause Category */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">
                  AI แนะนำ: Cause Category
                </p>
                <div className="space-y-1.5">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Primary Cause</p>
                    <p className="text-xs font-mono font-semibold text-gray-800 bg-white rounded-lg px-3 py-2 border border-blue-100">
                      <TypingText text={s.causeCategory} speed={14} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Cause Group</p>
                    <p className="text-xs font-mono font-semibold text-gray-800 bg-white rounded-lg px-3 py-2 border border-blue-100">
                      <TypingText text={s.causeGroup} speed={16} />
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard Resolution */}
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                    คำปิดเคสมาตรฐาน (Standard Resolution)
                  </p>
                  <button onClick={copyResolution}
                          className="text-xs px-2 py-1 rounded-lg font-medium transition-all"
                          style={{ background: copySuccess ? '#38A169' : '#FFD100', color: copySuccess ? 'white' : '#2E3192' }}>
                    {copySuccess ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-green-800 leading-relaxed bg-white rounded-lg p-3 border border-green-100">
                  <TypingText text={s.resolution} speed={8} />
                </p>
              </div>

              {/* Materials */}
              {s.materials.length > 0 && (
                <div className="rounded-xl border border-yellow-100 p-4" style={{ background: '#FFFBEB' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#B7791F' }}>
                    วัสดุที่ต้องเบิก / Materials Required
                  </p>
                  <div className="space-y-2">
                    {s.materials.map(m => (
                      <div key={m.code} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-yellow-100">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                             style={{ background: '#FFD100', color: '#2E3192' }}>
                          ✓
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{m.code}</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{m.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {s.materials.length === 0 && (
                <div className="rounded-xl border border-yellow-100 p-3 text-xs text-yellow-800"
                     style={{ background: '#FFFBEB' }}>
                  ✓ ไม่ต้องใช้วัสดุเพิ่มเติม — รอไฟฟ้ากลับคืน / อุปกรณ์จะ Boot ขึ้นเอง
                </div>
              )}

              {/* Tips */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500 font-semibold mb-1">💡 AI Tip</p>
                <p className="text-xs text-gray-600 leading-snug">{s.tips}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: '#2E3192' }}>
                  นำไปใช้ใน Ticket
                </button>
                <button className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                  แก้ไข
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
