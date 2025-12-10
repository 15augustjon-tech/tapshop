'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">เกิดข้อผิดพลาด</h1>
        <p className="text-gray-600 mb-6">
          กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อเรา
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            ลองใหม่
          </button>

          <Link
            href="/"
            className="block w-full py-3 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          ติดต่อเรา: LINE @tapshop หรือ support@tapshop.me
        </p>
      </div>
    </div>
  )
}
