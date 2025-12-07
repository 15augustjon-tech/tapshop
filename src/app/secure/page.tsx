'use client'

import Link from 'next/link'

export default function SecurePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">TapShop</Link>
          <Link
            href="/seller/signup"
            className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            สร้างร้านฟรี
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-black text-white rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">ความปลอดภัยของคุณ</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            TapShop ให้ความสำคัญกับความปลอดภัยของผู้ขายและผู้ซื้อเป็นอันดับหนึ่ง
          </p>
        </div>
      </section>

      {/* How We Protect You */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">เราปกป้องคุณอย่างไร</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Sellers */}
            <div className="bg-white p-8 border border-gray-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">🏪</span>
                สำหรับผู้ขาย
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">เก็บเงินปลายทาง (COD)</div>
                    <div className="text-sm text-gray-600">ไรเดอร์เก็บเงินจากลูกค้า ลดความเสี่ยงไม่ได้รับเงิน</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">โอนเงินรวดเร็ว</div>
                    <div className="text-sm text-gray-600">เงินจากออเดอร์โอนเข้าบัญชีภายใน 1-2 วันทำการ</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">ติดตามสถานะแบบเรียลไทม์</div>
                    <div className="text-sm text-gray-600">ดูสถานะการจัดส่งทุกออเดอร์ได้ตลอดเวลา</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">แจ้งเตือนทาง LINE</div>
                    <div className="text-sm text-gray-600">รับแจ้งเตือนออเดอร์ใหม่และสถานะการจัดส่งทันที</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* For Buyers */}
            <div className="bg-white p-8 border border-gray-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">🛒</span>
                สำหรับผู้ซื้อ
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">จ่ายเงินหลังได้รับของ</div>
                    <div className="text-sm text-gray-600">ตรวจสอบสินค้าก่อนจ่ายเงินให้ไรเดอร์</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">ไรเดอร์มืออาชีพ</div>
                    <div className="text-sm text-gray-600">ใช้บริการ Lalamove ที่มีประกันสินค้า</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">ติดตามไรเดอร์</div>
                    <div className="text-sm text-gray-600">ดูตำแหน่งไรเดอร์แบบเรียลไทม์</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">ร้านค้าตรวจสอบแล้ว</div>
                    <div className="text-sm text-gray-600">ผู้ขายทุกรายยืนยันตัวตนผ่านเบอร์โทรศัพท์</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">มาตรการความปลอดภัย</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">รหัส OTP</h3>
              <p className="text-gray-600 text-sm">ยืนยันตัวตนทุกครั้งด้วยรหัส OTP ทาง SMS</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">SSL Encryption</h3>
              <p className="text-gray-600 text-sm">ข้อมูลทุกอย่างเข้ารหัส HTTPS ปลอดภัย</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">บริษัทจดทะเบียน</h3>
              <p className="text-gray-600 text-sm">TapShop เป็นบริษัทจดทะเบียนถูกต้องตามกฎหมาย</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">คำถามเกี่ยวกับความปลอดภัย</h2>
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">ถ้าสินค้าเสียหายระหว่างจัดส่งจะทำอย่างไร?</h3>
              <p className="text-gray-600 text-sm">Lalamove มีประกันสินค้าสูงสุด 2,000 บาทต่อออเดอร์ หากสินค้าเสียหายระหว่างจัดส่ง สามารถติดต่อทีมงานเพื่อเคลมได้</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">ถ้าลูกค้าไม่รับของจะเป็นอย่างไร?</h3>
              <p className="text-gray-600 text-sm">ไรเดอร์จะนำสินค้ากลับมาส่งคืนที่ร้าน ผู้ขายจะไม่ถูกหักค่าบริการ ฿40 ในกรณีนี้</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">ข้อมูลส่วนตัวจะถูกเก็บรักษาอย่างไร?</h3>
              <p className="text-gray-600 text-sm">เราเก็บข้อมูลเฉพาะที่จำเป็นต่อการให้บริการ และไม่แชร์ข้อมูลกับบุคคลภายนอก ยกเว้นไรเดอร์ที่ต้องใช้ที่อยู่จัดส่ง</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold mb-2">ผู้ขายต้องมีใบอนุญาตค้าขายไหม?</h3>
              <p className="text-gray-600 text-sm">ไม่จำเป็น TapShop เหมาะสำหรับผู้ขายรายย่อยที่ขายของออนไลน์ แต่ผู้ขายต้องรับผิดชอบต่อภาษีของตัวเอง</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">ติดต่อเรา</h2>
          <p className="text-gray-600 mb-8">มีคำถามเพิ่มเติม? ทีมงานพร้อมช่วยเหลือ</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="bg-gray-50 p-6 border border-gray-200">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-bold mb-1">LINE</div>
              <div className="text-gray-600">@tapshop</div>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-200">
              <div className="text-2xl mb-2">📧</div>
              <div className="font-bold mb-1">Email</div>
              <div className="text-gray-600">support@tapshop.me</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">ทีมงานพร้อมให้บริการทุกวัน 9:00 - 21:00</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">พร้อมเริ่มขายกับ TapShop?</h2>
          <p className="text-gray-300 mb-8">สร้างร้านฟรี ไม่มีค่าใช้จ่ายรายเดือน</p>
          <Link
            href="/seller/signup"
            className="inline-block bg-white text-black px-8 py-4 text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            สร้างร้านฟรี
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold">TapShop</div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">หน้าแรก</Link>
            <Link href="/about" className="hover:text-white">เกี่ยวกับเรา</Link>
            <Link href="/contact" className="hover:text-white">ติดต่อ</Link>
          </div>
          <div className="text-sm text-gray-500">© 2024 TapShop</div>
        </div>
      </footer>
    </div>
  )
}
