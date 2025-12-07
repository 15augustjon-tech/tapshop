'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Address {
  id: string
  label: string
  name: string
  phone: string
  address: string
  is_default: boolean
}

interface Buyer {
  id: string
  phone: string
  name: string | null
  addresses: Address[]
}

export default function BuyerAccountPage() {
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetchBuyer()
  }, [])

  const fetchBuyer = async () => {
    try {
      const res = await fetch('/api/auth/buyer/me')
      const data = await res.json()

      if (!data.success) {
        if (data.error === 'unauthorized') {
          router.push('/buyer/login')
          return
        }
        return
      }

      setBuyer(data.buyer)
    } catch (err) {
      console.error('Fetch buyer error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      await fetch('/api/auth/buyer/logout', { method: 'POST' })
      router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
      setLoggingOut(false)
    }
  }

  const formatPhone = (phone: string) => {
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-XXX-${phone.slice(7)}`
    }
    return phone
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!buyer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-[5%]">
        <div className="text-center">
          <p className="text-secondary mb-4">ไม่พบข้อมูลผู้ใช้</p>
          <Link href="/buyer/login" className="text-black font-medium hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-border z-10">
        <div className="flex items-center justify-between px-[5%] h-14">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold">บัญชีของฉัน</h1>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm text-error hover:underline disabled:opacity-50"
          >
            {loggingOut ? 'กำลังออก...' : 'ออกจากระบบ'}
          </button>
        </div>
      </header>

      <div className="px-[5%] py-6 max-w-md mx-auto">
        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">{buyer.name || 'ผู้ใช้'}</p>
              <p className="text-secondary">{formatPhone(buyer.phone)}</p>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">ที่อยู่ที่บันทึกไว้</h2>
          </div>

          {buyer.addresses.length === 0 ? (
            <div className="p-6 border border-dashed border-border rounded-lg text-center">
              <svg className="w-12 h-12 text-secondary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-secondary text-sm">ยังไม่มีที่อยู่ที่บันทึกไว้</p>
              <p className="text-secondary text-xs mt-1">ที่อยู่จะถูกบันทึกเมื่อคุณสั่งซื้อ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buyer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{addr.label}</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary">{addr.name}</p>
                      <p className="text-sm text-secondary">{addr.phone}</p>
                      <p className="text-sm text-secondary line-clamp-2">{addr.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History Link */}
        <div className="mb-8">
          <Link
            href="/buyer/orders"
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">ประวัติคำสั่งซื้อ</span>
            </div>
            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
