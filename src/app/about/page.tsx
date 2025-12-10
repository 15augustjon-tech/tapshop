'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* Ambient Light Decorations */}
      <div className="ambient-light ambient-1" />
      <div className="ambient-light ambient-2" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 safe-area-top">
        <div className="max-w-[480px] mx-auto">
          <div className="glass-card !rounded-full px-4 py-2.5 flex items-center justify-between">
            <Link href="/" className="text-lg font-extrabold text-[#1a1a1a] tracking-tight">
              Tap<span className="text-[#22c55e]">Shop</span>
            </Link>
            <Link
              href="/"
              className="w-10 h-10 glass-card !rounded-xl flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-[480px] mx-auto px-5 pt-24 pb-12">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">ข้อมูลเพิ่มเติม</h1>
        <p className="text-[#7a6f63] mb-8">ทุกอย่างที่คุณต้องรู้เกี่ยวกับ TapShop</p>

        {/* Features Section */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-[#a69a8c] uppercase tracking-widest mb-4">ฟีเจอร์</h2>

          <div className="space-y-3">
            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box flex-shrink-0">
                  <span className="text-lg">🏪</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">ร้านค้าออนไลน์</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    สร้างหน้าร้านสวยงาม แชร์ลิงก์ให้ลูกค้าได้ทันที ไม่ต้องมีความรู้เรื่องเว็บไซต์
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box green flex-shrink-0">
                  <span className="text-lg">📦</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">จัดการสินค้า</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    เพิ่มรูป ตั้งราคา จัดหมวดหมู่ ตั้งสต็อก ทุกอย่างทำได้ง่ายๆ จากมือถือ
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box flex-shrink-0">
                  <span className="text-lg">📋</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">ระบบออเดอร์</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    ดูออเดอร์ทั้งหมด อนุมัติการสั่งซื้อ ติดตามสถานะ ครบจบในที่เดียว
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box green flex-shrink-0">
                  <span className="text-lg">🛵</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">จัดส่งอัตโนมัติ</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    ระบบจัดคิวไรเดอร์มารับสินค้าตามเวลาที่คุณกำหนด ไม่ต้องติดต่อเอง
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box flex-shrink-0">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">Dashboard รายได้</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    ดูยอดขายรายวัน/รายเดือน สินค้าขายดี สรุปข้อมูลให้เข้าใจง่าย
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box green flex-shrink-0">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">แจ้งเตือน LINE</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    ได้รับแจ้งเตือนทันทีเมื่อมีออเดอร์ใหม่ ไม่พลาดทุกการขาย
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Section */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-[#a69a8c] uppercase tracking-widest mb-4">การจัดส่ง</h2>

          <div className="glass-card p-5 mb-4">
            <h3 className="font-bold text-[#1a1a1a] mb-4">โซนจัดส่งและราคา</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#e5e0d8]">
                <div>
                  <p className="font-semibold text-[#1a1a1a]">โซน 1</p>
                  <p className="text-sm text-[#7a6f63]">ภายใน 5 กม.</p>
                </div>
                <p className="font-bold text-[#22c55e]">฿39</p>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e5e0d8]">
                <div>
                  <p className="font-semibold text-[#1a1a1a]">โซน 2</p>
                  <p className="text-sm text-[#7a6f63]">5-10 กม.</p>
                </div>
                <p className="font-bold text-[#22c55e]">฿59</p>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#e5e0d8]">
                <div>
                  <p className="font-semibold text-[#1a1a1a]">โซน 3</p>
                  <p className="text-sm text-[#7a6f63]">10-15 กม.</p>
                </div>
                <p className="font-bold text-[#22c55e]">฿79</p>
              </div>

              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-semibold text-[#1a1a1a]">โซน 4</p>
                  <p className="text-sm text-[#7a6f63]">15-20 กม.</p>
                </div>
                <p className="font-bold text-[#22c55e]">฿99</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 border-[#3b82f6]/30 bg-gradient-to-r from-[#3b82f6]/10 to-[#3b82f6]/5">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#1a1a1a] mb-1">เวลาจัดส่ง</p>
                <p className="text-sm text-[#7a6f63]">
                  ส่งถึงลูกค้าภายใน 1-2 ชั่วโมง หลังไรเดอร์รับสินค้า ให้บริการทุกวัน 10:00 - 20:00 น.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-[#a69a8c] uppercase tracking-widest mb-4">การชำระเงิน</h2>

          <div className="space-y-3">
            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box flex-shrink-0">
                  <span className="text-lg">📱</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">PromptPay QR</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    ลูกค้าสแกน QR จ่ายค่าสินค้าตรงเข้าบัญชี PromptPay ของคุณทันที
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="icon-box green flex-shrink-0">
                  <span className="text-lg">💵</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-1">เก็บเงินปลายทาง (COD)</h3>
                  <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                    ไรเดอร์เก็บเงินจากลูกค้าและโอนให้คุณภายในวันถัดไป
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 border-[#22c55e]/30 bg-gradient-to-r from-[#22c55e]/10 to-[#22c55e]/5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a1a] mb-1">คุณได้รับเงินเมื่อไหร่?</p>
                  <p className="text-sm text-[#7a6f63]">
                    PromptPay: ได้รับทันทีที่ลูกค้าจ่าย<br />
                    COD: โอนให้ภายใน 24 ชม. หลังส่งสำเร็จ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-[#a69a8c] uppercase tracking-widest mb-4">ขั้นตอนการใช้งาน</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">สมัครและสร้างร้าน</h3>
                <p className="text-sm text-[#7a6f63]">ยืนยันเบอร์โทร ใส่ชื่อร้าน เพิ่มที่อยู่รับสินค้า ตั้งเวลาจัดส่ง</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">เพิ่มสินค้า</h3>
                <p className="text-sm text-[#7a6f63]">ถ่ายรูป ตั้งชื่อ ใส่ราคา เพิ่มรายละเอียด สินค้าพร้อมขาย</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">แชร์ลิงก์ร้าน</h3>
                <p className="text-sm text-[#7a6f63]">ส่งลิงก์ให้ลูกค้าทาง LINE, Instagram, Facebook หรือที่ไหนก็ได้</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">รับออเดอร์</h3>
                <p className="text-sm text-[#7a6f63]">ลูกค้าสั่งซื้อ จ่ายเงิน คุณได้รับแจ้งเตือนทันที</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">ไรเดอร์มารับ-ส่ง</h3>
                <p className="text-sm text-[#7a6f63]">ยืนยันออเดอร์ เตรียมของ ไรเดอร์มารับตามเวลาที่นัด ส่งถึงลูกค้า</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-[#a69a8c] uppercase tracking-widest mb-4">คำถามที่พบบ่อย</h2>

          <div className="space-y-3">
            <div className="glass-card p-4">
              <h3 className="font-bold text-[#1a1a1a] mb-2">TapShop คิดค่าบริการเท่าไหร่?</h3>
              <p className="text-sm text-[#7a6f63]">
                ไม่มีค่าสมัคร ไม่มีค่ารายเดือน จ่ายแค่ค่าส่งเมื่อมีออเดอร์ (ลูกค้าเป็นคนจ่าย)
              </p>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-bold text-[#1a1a1a] mb-2">ขายสินค้าอะไรได้บ้าง?</h3>
              <p className="text-sm text-[#7a6f63]">
                ขายได้เกือบทุกอย่าง ยกเว้นสินค้าผิดกฎหมาย อาหารสด ของเหลวปริมาณมาก และสินค้าอันตราย
              </p>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-bold text-[#1a1a1a] mb-2">ส่งนอก กทม. ได้ไหม?</h3>
              <p className="text-sm text-[#7a6f63]">
                ตอนนี้ให้บริการเฉพาะในกรุงเทพฯ และปริมณฑล รัศมี 20 กม. จากร้านค้า
              </p>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-bold text-[#1a1a1a] mb-2">ถ้าสินค้าเสียหายระหว่างส่ง?</h3>
              <p className="text-sm text-[#7a6f63]">
                มีประกันสินค้าเสียหายระหว่างขนส่ง สูงสุด 2,000 บาท/ออเดอร์
              </p>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-bold text-[#1a1a1a] mb-2">ยกเลิกออเดอร์ได้ไหม?</h3>
              <p className="text-sm text-[#7a6f63]">
                ยกเลิกได้ก่อนไรเดอร์รับสินค้า หากลูกค้าจ่ายแล้วจะได้รับเงินคืนภายใน 3-5 วัน
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-10">
          <h2 className="text-xs font-bold text-[#a69a8c] uppercase tracking-widest mb-4">ติดต่อเรา</h2>

          <div className="glass-card p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#06c755] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a1a]">LINE Official</p>
                  <p className="text-sm text-[#7a6f63]">@tapshop</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a1a]">Email</p>
                  <p className="text-sm text-[#7a6f63]">help@tapshop.me</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="glass-card p-6 border-[#22c55e]/30 bg-gradient-to-r from-[#22c55e]/10 to-[#22c55e]/5 mb-10">
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">พร้อมเริ่มขายแล้ว?</h3>
          <p className="text-sm text-[#7a6f63] mb-4">สร้างร้านฟรี เริ่มขายได้ภายใน 2 นาที</p>
          <Link href="/seller/signup" className="btn-primary w-full text-center">
            สร้างร้านเลย
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[rgba(166,154,140,0.7)]">
          <p className="mb-2">© 2025 TapShop</p>
          <div className="flex justify-center gap-4">
            <Link href="/terms" className="hover:text-[#7a6f63] transition-colors">
              ข้อกำหนด
            </Link>
            <Link href="/contact" className="hover:text-[#7a6f63] transition-colors">
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
