'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: 'TapShop คืออะไร?',
      a: 'TapShop คือแพลตฟอร์มสำหรับขายของออนไลน์ ที่ช่วยให้คุณสร้างร้านค้า รับออเดอร์ และจัดส่งสินค้าถึงลูกค้าได้ง่ายๆ โดยไม่ต้องตอบ DM หรือเรียกไรเดอร์เอง'
    },
    {
      q: 'ค่าใช้จ่ายเท่าไหร่?',
      a: 'สมัครฟรี ไม่มีค่ารายเดือน จ่ายแค่ค่าส่ง + ค่าบริการ ฿40 ต่อออเดอร์ (หักจากยอดเก็บเงินปลายทาง)'
    },
    {
      q: 'รับส่งพื้นที่ไหนบ้าง?',
      a: 'ปัจจุบันรับส่งในกรุงเทพและปริมณฑล รัศมี 20 กม. จากร้านค้า กำลังขยายพื้นที่เร็วๆ นี้'
    },
    {
      q: 'ลูกค้าจ่ายเงินยังไง?',
      a: 'ลูกค้าจ่ายเงินสดให้ไรเดอร์ตอนรับของ (เก็บเงินปลายทาง/COD) เราจะโอนเงินให้คุณหลังจัดส่งสำเร็จ'
    },
    {
      q: 'มีปัญหาติดต่อยังไง?',
      a: 'แอดไลน์ @tapshop หรืออีเมล support@tapshop.me ทีมงานพร้อมช่วยเหลือทุกวัน 9:00-21:00'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">TapShop</Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-black">TH</span>
              <span className="mx-1">|</span>
              <span>EN</span>
            </div>
            <Link
              href="/seller/signup"
              className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              สร้างร้านฟรี
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            ขายของออนไลน์
            <br />
            ส่งถึงบ้าน
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            สร้างร้านฟรี รับออเดอร์ง่าย ส่งของอัตโนมัติ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/seller/signup"
              className="bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              สร้างร้านฟรี
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">ตั้งร้าน 5 นาที</h3>
            <p className="text-gray-600">ใส่ข้อมูล เพิ่มสินค้า พร้อมขายทันที</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">ลูกค้าสั่งเอง</h3>
            <p className="text-gray-600">ไม่ต้องตอบแชท ไม่ต้องจดที่อยู่</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">เราส่งให้</h3>
            <p className="text-gray-600">ไรเดอร์รับของถึงหน้าบ้าน ส่งถึงลูกค้า</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">วิธีใช้งาน</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-2">สร้างร้าน</h3>
              <p className="text-gray-600">ใส่ข้อมูลร้าน เพิ่มรูปสินค้า ตั้งราคา เสร็จใน 5 นาที</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-2">แชร์ลิงก์</h3>
              <p className="text-gray-600">ส่งลิงก์ร้านให้ลูกค้าทาง IG, Facebook, LINE</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-2">เราจัดส่ง</h3>
              <p className="text-gray-600">ไรเดอร์มารับของถึงบ้าน ส่งให้ลูกค้า เก็บเงินให้</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-black text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">ไม่ต้องทำเอง</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '💬', text: 'ไม่ต้องตอบ DM' },
              { icon: '📝', text: 'ไม่ต้องจดที่อยู่' },
              { icon: '🛵', text: 'ไม่ต้องเรียก Grab เอง' },
              { icon: '💵', text: 'เก็บเงินปลายทางได้' }
            ].map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <p className="text-lg font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">ราคา</h2>
          <div className="bg-gray-50 p-8 md:p-12 rounded-lg">
            <div className="text-5xl md:text-6xl font-bold mb-4">ฟรี</div>
            <p className="text-xl text-gray-600 mb-6">ไม่มีค่าสมัคร ไม่มีค่ารายเดือน</p>
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-lg mb-2">จ่ายแค่ตอนมีออเดอร์</p>
              <p className="text-2xl font-bold">ค่าส่ง + ฿40/ออเดอร์</p>
              <p className="text-sm text-gray-500 mt-2">หักจากยอด COD อัตโนมัติ</p>
            </div>
            <div className="mt-8">
              <Link
                href="/seller/signup"
                className="inline-block bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
              >
                เริ่มต้นฟรี
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">คำถามที่พบบ่อย</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-medium">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">พร้อมเริ่มขาย?</h2>
          <p className="text-lg text-gray-600 mb-8">สร้างร้านได้เลย ไม่มีค่าใช้จ่าย</p>
          <Link
            href="/seller/signup"
            className="inline-block bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            สร้างร้านฟรี วันนี้
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-black text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4">TapShop</div>
              <p className="text-gray-400 text-sm">ขายของออนไลน์ ส่งถึงบ้าน</p>
            </div>
            <div>
              <div className="font-medium mb-3">ลิงก์</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">เกี่ยวกับเรา</Link></li>
                <li><Link href="/secure" className="hover:text-white">ความปลอดภัย</Link></li>
                <li><Link href="/contact" className="hover:text-white">ติดต่อเรา</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-3">สำหรับผู้ขาย</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/seller/signup" className="hover:text-white">สร้างร้าน</Link></li>
                <li><Link href="/seller/login" className="hover:text-white">เข้าสู่ระบบ</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-3">ติดต่อ</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>LINE: @tapshop</li>
                <li>support@tapshop.me</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2025 TapShop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
