'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* Ambient Light Decorations */}
      <div className="ambient-light ambient-1" />
      <div className="ambient-light ambient-2" />

      {/* Glass Orbs */}
      <div className="glass-orb w-[100px] h-[100px] top-[8%] right-[8%] animate-orb" style={{ animationDelay: '0s' }} />
      <div className="glass-orb w-[60px] h-[60px] bottom-[25%] left-[5%] animate-orb" style={{ animationDelay: '2s' }} />
      <div className="glass-orb w-[40px] h-[40px] top-[45%] right-[5%] animate-orb" style={{ animationDelay: '4s' }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 safe-area-top">
        <div className="max-w-[480px] mx-auto">
          <div className="glass-card !rounded-full px-4 py-2.5 flex items-center justify-between">
            <span className="text-lg font-extrabold text-[#1a1a1a] tracking-tight">
              Tap<span className="text-[#22c55e]">Shop</span>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/seller/signup"
                className="px-4 py-2 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white text-sm font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                สร้างร้าน
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="w-10 h-10 glass-card !rounded-xl flex flex-col items-center justify-center gap-1"
              >
                <span className="w-4 h-0.5 bg-[#1a1a1a] rounded-full" />
                <span className="w-4 h-0.5 bg-[#1a1a1a] rounded-full" />
                <span className="w-4 h-0.5 bg-[#1a1a1a] rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-4 right-4 left-4 max-w-[480px] mx-auto safe-area-top">
            <div className="glass-card !rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-extrabold text-[#1a1a1a]">
                  Tap<span className="text-[#22c55e]">Shop</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 glass-card !rounded-xl flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                <Link
                  href="/seller/signup"
                  className="flex items-center gap-3 p-4 glass-card-inner !rounded-2xl"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-xl">🏪</span>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">สร้างร้านค้า</p>
                    <p className="text-xs text-[#7a6f63]">เริ่มต้นฟรี</p>
                  </div>
                </Link>
                <Link
                  href="/seller/login"
                  className="flex items-center gap-3 p-4 glass-card-inner !rounded-2xl"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">เข้าสู่ระบบ</p>
                    <p className="text-xs text-[#7a6f63]">จัดการร้านค้า</p>
                  </div>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-3 p-4 glass-card-inner !rounded-2xl"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-xl">📖</span>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">ข้อมูลเพิ่มเติม</p>
                    <p className="text-xs text-[#7a6f63]">เรียนรู้เกี่ยวกับ TapShop</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-[480px] mx-auto px-5 pt-24 pb-12">
        {/* Hero Headline */}
        <h1 className="text-center text-[clamp(32px,8vw,44px)] font-extrabold text-[#1a1a1a] leading-[1.1] tracking-tight mb-4">
          ขายออนไลน์<br />
          <span className="relative inline-block">
            ง่ายกว่าที่คิด
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-[rgba(34,197,94,0.25)] to-[rgba(134,239,172,0.25)] rounded -z-10" />
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-center text-[15px] text-[#7a6f63] leading-[1.7] mb-8">
          สร้างร้าน เพิ่มสินค้า แชร์ลิงก์<br />
          เราจัดการส่งของให้ทั้งหมด
        </p>

        {/* Phone Mockups */}
        <div className="flex justify-center gap-3 mb-10 perspective-[1500px]">
          {/* Left Phone - Buyer View */}
          <div className="w-[150px] h-[300px] bg-gradient-to-b from-[#1d1d1f] to-[#0a0a0a] rounded-[28px] p-2 shadow-2xl transform rotate-y-[8deg] hover:-translate-y-2 transition-transform">
            <div className="w-full h-full bg-gradient-to-b from-[#f8f4ef] to-[#f0e9df] rounded-[22px] overflow-hidden relative">
              {/* Status Bar */}
              <div className="h-5 flex items-center justify-between px-3 pt-1">
                <span className="text-[6px] font-semibold">9:41</span>
                <div className="w-12 h-3.5 bg-black rounded-full" />
                <div className="flex gap-0.5">
                  <div className="w-2 h-1.5 bg-black/70 rounded-sm" />
                  <div className="w-2 h-1.5 bg-black/70 rounded-sm" />
                </div>
              </div>

              {/* Shop Header */}
              <div className="px-2 py-1.5 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ec4899] to-[#db2777] flex items-center justify-center text-[8px]">👗</div>
                <div className="flex-1">
                  <p className="text-[7px] font-bold">Nana Shop</p>
                  <p className="text-[5px] text-[#22c55e]">✓ ยืนยันแล้ว</p>
                </div>
                <div className="w-5 h-5 bg-white/60 rounded-lg flex items-center justify-center text-[8px]">🛒</div>
              </div>

              {/* Delivery Banner */}
              <div className="mx-2 p-1.5 bg-white/60 rounded-lg mb-2">
                <p className="text-[6px] font-semibold">🚀 ส่งวันนี้ เริ่ม ฿39</p>
              </div>

              {/* Products Grid */}
              <div className="px-2 grid grid-cols-2 gap-1.5">
                <div className="bg-white rounded-lg p-1">
                  <div className="aspect-square bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-md flex items-center justify-center text-lg mb-1">👕</div>
                  <p className="text-[6px] font-semibold truncate">เสื้อยืด Vintage</p>
                  <p className="text-[7px] font-bold">฿450</p>
                </div>
                <div className="bg-white rounded-lg p-1">
                  <div className="aspect-square bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] rounded-md flex items-center justify-center text-lg mb-1">👖</div>
                  <p className="text-[6px] font-semibold truncate">กางเกงยีนส์</p>
                  <p className="text-[7px] font-bold">฿890</p>
                </div>
                <div className="bg-white rounded-lg p-1">
                  <div className="aspect-square bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] rounded-md flex items-center justify-center text-lg mb-1">👗</div>
                  <p className="text-[6px] font-semibold truncate">เดรส 90s</p>
                  <p className="text-[7px] font-bold">฿650</p>
                </div>
                <div className="bg-white rounded-lg p-1">
                  <div className="aspect-square bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] rounded-md flex items-center justify-center text-lg mb-1">👔</div>
                  <p className="text-[6px] font-semibold truncate">เชิ้ตลายสก็อต</p>
                  <p className="text-[7px] font-bold">฿550</p>
                </div>
              </div>

              {/* Cart Bar */}
              <div className="absolute bottom-2 left-2 right-2 bg-[#1a1a1a] rounded-full py-2 px-3 flex justify-between items-center">
                <span className="text-[7px] text-white font-semibold">🛒 2 ชิ้น</span>
                <span className="text-[7px] text-white font-bold">฿1,340 →</span>
              </div>
            </div>
          </div>

          {/* Right Phone - Seller Dashboard */}
          <div className="w-[150px] h-[300px] bg-gradient-to-b from-[#1d1d1f] to-[#0a0a0a] rounded-[28px] p-2 shadow-2xl transform rotate-y-[-8deg] hover:-translate-y-2 transition-transform">
            <div className="w-full h-full bg-gradient-to-b from-[#f8f4ef] to-[#f0e9df] rounded-[22px] overflow-hidden relative">
              {/* Status Bar */}
              <div className="h-5 flex items-center justify-between px-3 pt-1">
                <span className="text-[6px] font-semibold">9:41</span>
                <div className="w-12 h-3.5 bg-black rounded-full" />
                <div className="flex gap-0.5">
                  <div className="w-2 h-1.5 bg-black/70 rounded-sm" />
                  <div className="w-2 h-1.5 bg-black/70 rounded-sm" />
                </div>
              </div>

              {/* Dashboard Header */}
              <div className="px-2 py-1.5 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-bold">Nana Shop</p>
                  <p className="text-[5px] text-[#7a6f63]">Dashboard</p>
                </div>
                <div className="flex gap-1">
                  <div className="w-5 h-5 bg-white/60 rounded-lg flex items-center justify-center text-[8px]">📊</div>
                  <div className="w-5 h-5 bg-white/60 rounded-lg flex items-center justify-center text-[8px]">⚙️</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="px-2 grid grid-cols-2 gap-1.5 mb-2">
                <div className="bg-white/60 rounded-lg p-1.5">
                  <p className="text-[5px] text-[#7a6f63]">รายได้วันนี้</p>
                  <p className="text-[9px] font-bold text-[#22c55e]">฿2,450</p>
                </div>
                <div className="bg-white/60 rounded-lg p-1.5">
                  <p className="text-[5px] text-[#7a6f63]">ออเดอร์รอดำเนินการ</p>
                  <p className="text-[9px] font-bold text-[#f59e0b]">3</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-2 flex gap-1 mb-2">
                <div className="flex-1 py-1 bg-[#1a1a1a] rounded-lg text-center">
                  <span className="text-[6px] text-white font-semibold">ออเดอร์</span>
                </div>
                <div className="flex-1 py-1 bg-white/40 rounded-lg text-center">
                  <span className="text-[6px] text-[#7a6f63] font-semibold">สินค้า</span>
                </div>
              </div>

              {/* Orders List */}
              <div className="px-2 space-y-1.5">
                <div className="bg-white rounded-lg p-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[6px] font-bold">#1234</span>
                    <span className="text-[5px] px-1.5 py-0.5 bg-[#fef3c7] text-[#92400e] rounded-full font-semibold">รอยืนยัน</span>
                  </div>
                  <p className="text-[5px] text-[#7a6f63]">สมชาย • 2 ชิ้น</p>
                  <p className="text-[6px] font-semibold">฿890</p>
                </div>
                <div className="bg-white rounded-lg p-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[6px] font-bold">#1233</span>
                    <span className="text-[5px] px-1.5 py-0.5 bg-[#dcfce7] text-[#166534] rounded-full font-semibold">กำลังส่ง</span>
                  </div>
                  <p className="text-[5px] text-[#7a6f63]">วิชัย • 1 ชิ้น</p>
                  <p className="text-[6px] font-semibold">฿450</p>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/80 border-t border-white/50 py-1.5 px-3 flex justify-around">
                <div className="flex flex-col items-center">
                  <span className="text-[10px]">🏠</span>
                  <span className="text-[5px] text-[#1a1a1a] font-semibold">หน้าหลัก</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px]">📦</span>
                  <span className="text-[5px] text-[#7a6f63]">สินค้า</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px]">⚙️</span>
                  <span className="text-[5px] text-[#7a6f63]">ตั้งค่า</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Labels */}
        <div className="flex justify-center gap-16 mb-10">
          <div className="text-center">
            <p className="text-sm font-bold text-[#1a1a1a]">ลูกค้าเห็น</p>
            <p className="text-xs text-[#7a6f63]">หน้าร้านของคุณ</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#1a1a1a]">คุณจัดการ</p>
            <p className="text-xs text-[#7a6f63]">Dashboard ร้านค้า</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 mb-10">
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

        {/* How It Works */}
        <div className="space-y-3 mb-10">
          <h2 className="text-xs font-bold text-[#a69a8c] uppercase tracking-widest text-center mb-4">วิธีใช้งาน</h2>

          <div className="glass-card p-4">
            <div className="flex items-start gap-3 relative z-10">
              <div className="icon-box flex-shrink-0">
                <span className="text-lg">🏪</span>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">สร้างร้านใน 2 นาที</h3>
                <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                  ใส่ชื่อร้าน เพิ่มสินค้า พร้อมขายทันที
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start gap-3 relative z-10">
              <div className="icon-box green flex-shrink-0">
                <span className="text-lg">🛵</span>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">ส่งด่วนใน กทม.</h3>
                <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                  ไรเดอร์มารับถึงบ้าน ส่งถึงลูกค้า 1-2 ชม.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start gap-3 relative z-10">
              <div className="icon-box flex-shrink-0">
                <span className="text-lg">💵</span>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">รับเงินผ่าน PromptPay</h3>
                <p className="text-[13px] text-[#7a6f63] leading-relaxed">
                  ลูกค้าจ่ายค่าสินค้าผ่าน QR ตรงเข้าบัญชีคุณ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="glass-card p-5 mb-10 border-[#22c55e]/20">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="icon-box green">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">ใช้งานฟรี</h3>
              <p className="text-[13px] text-[#7a6f63]">ไม่มีค่าสมัคร ไม่มีค่ารายเดือน</p>
            </div>
          </div>
          <p className="text-[13px] text-[#7a6f63] relative z-10">
            จ่ายแค่ค่าส่ง (เริ่ม ฿39) เมื่อมีออเดอร์ ลูกค้าเป็นคนจ่าย
          </p>
        </div>

        {/* Info Link */}
        <div className="text-center mb-8">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a6f63] hover:text-[#1a1a1a] transition-colors"
          >
            ดูข้อมูลเพิ่มเติม
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
