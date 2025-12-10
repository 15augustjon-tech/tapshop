'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  status: string
  status_text: string
  total: number
  scheduled_date: string
  scheduled_time: string
  created_at: string
  seller: {
    shop_name: string
    shop_slug: string
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function BuyerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/buyers/me/orders')
      const data = await res.json()

      if (!data.success) {
        if (data.error === 'unauthorized') {
          router.push('/buyer/login?redirect=/buyer/orders')
          return
        }
        return
      }

      setOrders(data.orders)
    } catch (err) {
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-border z-10">
        <div className="flex items-center px-[5%] h-14">
          <Link
            href="/buyer/account"
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center font-bold">ประวัติคำสั่งซื้อ</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-[5%] py-6 max-w-md mx-auto">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-secondary text-lg mb-2">ยังไม่มีคำสั่งซื้อ</p>
            <p className="text-secondary text-sm">เริ่มช้อปปิ้งเลย!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={order.seller ? `/${order.seller.shop_slug}/order/${order.id}` : '#'}
                className="block p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold">{order.order_number}</p>
                    {order.seller && (
                      <p className="text-sm text-secondary">{order.seller.shop_name}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[order.status] || 'bg-neutral-100 text-neutral-800'}`}>
                    {order.status_text}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{formatDate(order.created_at)}</span>
                  <span className="font-bold">฿{order.total.toLocaleString()}</span>
                </div>

                {order.scheduled_date && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-secondary">
                      กำหนดส่ง: {order.scheduled_date} {order.scheduled_time}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
