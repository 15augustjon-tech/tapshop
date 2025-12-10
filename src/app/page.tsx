'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* Ambient Light Decorations */}
      <div className="ambient-light ambient-1" />
      <div className="ambient-light ambient-2" />
      <div className="ambient-light ambient-3" />

      {/* Glass Orbs */}
      <div className="glass-orb w-[120px] h-[120px] top-[8%] right-[5%] animate-orb" style={{ animationDelay: '0s' }} />
      <div className="glass-orb w-[80px] h-[80px] bottom-[25%] left-[5%] animate-orb" style={{ animationDelay: '2s' }} />
      <div className="glass-orb w-[60px] h-[60px] top-[45%] right-[8%] animate-orb" style={{ animationDelay: '4s' }} />

      {/* Floating Sparkles */}
      <div className="floating-element float-sparkle top-[18%] left-[12%] animate-twinkle" style={{ animationDelay: '0s' }} />
      <div className="floating-element float-sparkle top-[35%] right-[15%] animate-twinkle" style={{ animationDelay: '1s' }} />
      <div className="floating-element float-sparkle bottom-[30%] left-[18%] animate-twinkle" style={{ animationDelay: '0.5s' }} />
      <div className="floating-element float-sparkle top-[60%] right-[12%] animate-twinkle" style={{ animationDelay: '1.5s' }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-5">
        <div className="max-w-[480px] mx-auto">
          <div className="glass-card !rounded-full px-5 py-3 flex items-center justify-between">
            <span className="text-lg font-extrabold text-[#1a1a1a] tracking-tight">
              Tap<span className="text-[#22c55e]">Shop</span>
            </span>
            <Link
              href="/seller/signup"
              className="px-5 py-2.5 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white text-sm font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              สร้างร้านฟรี
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-[480px] mx-auto px-5 pt-28 pb-12">
        {/* Hero Headline */}
        <h1 className="text-center text-[clamp(36px,8vw,48px)] font-extrabold text-[#1a1a1a] leading-[1.1] tracking-tight mb-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          ขายออนไลน์<br />
          <span className="relative inline-block">
            ง่ายกว่าที่คิด
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-[rgba(34,197,94,0.25)] to-[rgba(134,239,172,0.25)] rounded -z-10" />
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-center text-[16px] text-[#7a6f63] leading-[1.7] mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          สร้างร้าน ใส่สินค้า แชร์ลิงก์ แค่นั้น<br />
          เราจัดการส่งของและเก็บเงินให้ทั้งหมด
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mb-12 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <Link href="/seller/signup" className="btn-primary w-full text-center">
            เริ่มต้นฟรี
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="/seller/login" className="btn-secondary w-full text-center">
            เข้าสู่ระบบ
          </Link>
        </div>

        {/* Features Grid */}
        <div className="space-y-4 mb-10">
          {/* Feature 1 */}
          <div className="glass-card p-6 animate-card animate-card-1">
            <div className="flex items-start gap-4">
              <div className="icon-box green flex-shrink-0">
                <span className="text-2xl">🏪</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-1">สร้างร้านใน 2 นาที</h3>
                <p className="text-[14px] text-[#7a6f63] leading-relaxed">
                  ใส่ชื่อร้าน เพิ่มสินค้า พร้อมขาย<br />ไม่ต้องรู้โค้ด ไม่ต้องเซ็ตอัพอะไร
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-6 animate-card animate-card-2">
            <div className="flex items-start gap-4">
              <div className="icon-box green flex-shrink-0 animate-bounce-gentle">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-1">ส่งด่วนใน กทม.</h3>
                <p className="text-[14px] text-[#7a6f63] leading-relaxed">
                  ไรเดอร์มารับสินค้าถึงหน้าบ้าน<br />ส่งถึงลูกค้าภายใน 1-2 ชั่วโมง
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-6 animate-card animate-card-3">
            <div className="flex items-start gap-4">
              <div className="icon-box green flex-shrink-0">
                <span className="text-2xl">💵</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-1">รับเงินผ่าน PromptPay</h3>
                <p className="text-[14px] text-[#7a6f63] leading-relaxed">
                  ลูกค้าจ่ายค่าสินค้าผ่าน QR<br />จ่ายค่าส่งให้ไรเดอร์ตอนรับของ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What You Do Section */}
        <div className="glass-card p-6 mb-4 animate-card animate-card-4">
          <h3 className="section-title relative z-10">สิ่งที่คุณทำ</h3>
          <div className="flex flex-col gap-3.5 relative z-10">
            {['เพิ่มสินค้า ตั้งราคา', 'แชร์ลิงก์ให้ลูกค้า', 'เตรียมของรอไรเดอร์มารับ'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[15px] text-[#1a1a1a]">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What We Do Section */}
        <div className="glass-card p-6 mb-4 animate-card animate-card-5">
          <h3 className="section-title relative z-10">สิ่งที่เราทำ</h3>
          <div className="flex flex-col gap-3.5 relative z-10">
            {[
              'รับออเดอร์จากลูกค้า',
              'ส่งไรเดอร์ไปรับของ',
              'จัดส่งถึงลูกค้า',
              'เก็บเงินค่าส่งปลายทาง'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[15px] text-[#1a1a1a]">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Section */}
        <div className="glass-card p-6 mb-10 animate-card" style={{ animationDelay: '0.6s' }}>
          <h3 className="section-title relative z-10">ค่าใช้จ่าย</h3>
          <p className="text-[15px] text-[#7a6f63] leading-relaxed relative z-10">
            <span className="text-[#1a1a1a] font-bold">ไม่มีค่ารายเดือน ไม่มีค่าสมัคร</span><br />
            จ่ายแค่ค่าส่งเมื่อมีออเดอร์
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[rgba(166,154,140,0.7)]">
          <p className="mb-2">© 2025 TapShop • สร้างด้วย ❤️ ใน กรุงเทพฯ</p>
          <Link href="/terms" className="hover:text-[#7a6f63] transition-colors">
            ข้อกำหนดและเงื่อนไข
          </Link>
        </div>
      </div>
    </div>
  )
}
