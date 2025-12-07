import Link from 'next/link'

export default function ShopNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-[5%]">
      <div className="text-center">
        {/* Icon */}
        <div className="mb-6">
          <svg className="w-20 h-20 text-neutral-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">ไม่พบร้านค้า</h1>

        {/* Description */}
        <p className="text-secondary mb-8 max-w-sm mx-auto">
          ลิงก์ร้านค้านี้ไม่มีอยู่หรือถูกปิดใช้งาน
        </p>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  )
}
