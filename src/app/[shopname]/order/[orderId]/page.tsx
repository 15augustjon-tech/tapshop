'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface Props {
  params: Promise<{ shopname: string; orderId: string }>
}

interface OrderItem {
  id: string
  product_name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  order_number: string
  status: string
  status_text: string
  buyer_name: string
  buyer_phone: string
  buyer_address: string
  buyer_notes: string | null
  subtotal: number
  delivery_fee: number
  cod_fee: number
  total: number
  scheduled_date: string
  scheduled_time: string
  created_at: string
  seller: {
    shop_name: string
    shop_slug: string
    phone: string
  }
  items: OrderItem[]
  delivery: {
    driver_name?: string
    driver_phone?: string
    vehicle_plate?: string
    tracking_url?: string
  } | null
}

const STATUS_STEPS = [
  { key: 'pending', label: 'รอยืนยัน', icon: 'clock' },
  { key: 'confirmed', label: 'ยืนยันแล้ว', icon: 'check' },
  { key: 'preparing', label: 'รอเตรียมของ', icon: 'box' },
  { key: 'dispatched', label: 'ไรเดอร์รับแล้ว', icon: 'truck' },
  { key: 'picked_up', label: 'กำลังจัดส่ง', icon: 'delivery' },
  { key: 'delivered', label: 'ส่งแล้ว', icon: 'home' }
]

function getStatusIndex(status: string): number {
  const index = STATUS_STEPS.findIndex(s => s.key === status)
  return index >= 0 ? index : 0
}

export default function OrderSuccessPage({ params }: Props) {
  const { shopname, orderId } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'ไม่พบคำสั่งซื้อ')
        return
      }

      setOrder(data.order)
    } catch (err) {
      console.error('Fetch order error:', err)
      setError('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="icon-box w-16 h-16 !rounded-[20px] animate-pulse">
          <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center px-4">
        <div className="glass-card !rounded-[24px] p-8 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-[#ef4444] mb-4 font-medium">{error || 'ไม่พบคำสั่งซื้อ'}</p>
          <Link
            href={`/${shopname}`}
            className="btn-secondary inline-block"
          >
            กลับไปหน้าร้าน
          </Link>
        </div>
      </div>
    )
  }

  const statusIndex = getStatusIndex(order.status)
  const isCancelled = order.status === 'cancelled'
  const isPending = order.status === 'pending'
  const isDelivered = order.status === 'delivered'

  return (
    <div className="min-h-screen bg-gradient-main pb-8 overflow-x-hidden">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass-card !rounded-[20px] overflow-hidden">
          <div className="flex items-center px-4 h-[56px] relative z-10">
            <Link
              href={`/${shopname}`}
              className="w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="flex-1 text-center font-bold text-[#1a1a1a]">คำสั่งซื้อ</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Success Banner */}
        {isPending && (
          <div className="glass-card !rounded-[24px] p-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center mx-auto mb-4 animate-pop">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">สั่งซื้อสำเร็จ!</h2>
            <p className="text-[#7a6f63] mb-5">หมายเลขคำสั่งซื้อ: {order.order_number}</p>

            <div className="glass-card-inner !rounded-[20px] p-5">
              <p className="text-[#7a6f63] text-sm mb-2">เตรียมเงินสดให้ไรเดอร์</p>
              <p className="text-4xl font-bold text-[#1a1a1a]">฿{order.delivery_fee}</p>
              <p className="text-[#a69a8c] text-xs mt-2">ค่าจัดส่ง</p>
            </div>
          </div>
        )}

        {/* Delivered Banner */}
        {isDelivered && (
          <div className="glass-card !rounded-[24px] p-6 text-center border border-[#22c55e]/30 bg-[rgba(34,197,94,0.05)] animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#22c55e] mb-2">ส่งสำเร็จแล้ว!</h2>
            <p className="text-[#7a6f63]">ขอบคุณที่ใช้บริการ</p>
          </div>
        )}

        {/* Order Number (for non-pending, non-delivered states) */}
        {!isPending && !isDelivered && !isCancelled && (
          <div className="glass-card !rounded-[24px] p-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="icon-box w-12 h-12 !rounded-[14px]">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <p className="text-[#7a6f63] text-sm">หมายเลขคำสั่งซื้อ</p>
                <p className="font-bold text-lg text-[#1a1a1a]">{order.order_number}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="glass-card !rounded-[24px] p-5 border border-[#ef4444]/30 bg-[rgba(239,68,68,0.05)] animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#ef4444]">คำสั่งซื้อถูกยกเลิก</p>
                <p className="text-[#7a6f63] text-sm">หมายเลข: {order.order_number}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="glass-card !rounded-[24px] p-5 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-box w-10 h-10 !rounded-[12px]">
                <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1a1a1a]">สถานะการจัดส่ง</h3>
            </div>

            <div className="space-y-0">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= statusIndex
                const isCurrent = index === statusIndex

                return (
                  <div key={step.key} className="flex">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white shadow-md'
                            : 'glass-card-inner'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 bg-[#a69a8c] rounded-full" />
                        )}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-8 transition-all ${
                            index < statusIndex ? 'bg-[#22c55e]' : 'bg-white/50'
                          }`}
                        />
                      )}
                    </div>
                    {/* Step label */}
                    <div className="pb-8">
                      <p
                        className={`font-medium transition-colors ${
                          isCurrent ? 'text-[#1a1a1a]' : isCompleted ? 'text-[#22c55e]' : 'text-[#a69a8c]'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-[#7a6f63] mt-0.5">กำลังดำเนินการ</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Driver Info */}
        {order.delivery && order.delivery.driver_name && (
          <div className="glass-card !rounded-[24px] p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a]">ไรเดอร์</h3>
                <p className="text-[#7a6f63] text-sm">{order.delivery.driver_name}</p>
              </div>
            </div>

            <div className="glass-card-inner !rounded-[16px] p-4 space-y-3">
              {order.delivery.driver_phone && (
                <div className="flex justify-between items-center">
                  <span className="text-[#7a6f63] text-sm">เบอร์โทร</span>
                  <a
                    href={`tel:${order.delivery.driver_phone}`}
                    className="font-medium text-[#1a1a1a] hover:text-[#22c55e] transition-colors"
                  >
                    {order.delivery.driver_phone}
                  </a>
                </div>
              )}
              {order.delivery.vehicle_plate && (
                <div className="flex justify-between items-center">
                  <span className="text-[#7a6f63] text-sm">ทะเบียนรถ</span>
                  <span className="font-medium text-[#1a1a1a]">{order.delivery.vehicle_plate}</span>
                </div>
              )}
            </div>

            {order.delivery.tracking_url && (
              <a
                href={order.delivery.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full mt-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                ติดตามไรเดอร์
              </a>
            )}
          </div>
        )}

        {/* Order Details (Collapsible) */}
        <div className="glass-card !rounded-[24px] overflow-hidden animate-fade-in" style={{ animationDelay: '150ms' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-5"
          >
            <div className="flex items-center gap-3">
              <div className="icon-box w-10 h-10 !rounded-[12px]">
                <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="font-bold text-[#1a1a1a]">รายละเอียดคำสั่งซื้อ</span>
            </div>
            <svg
              className={`w-5 h-5 text-[#7a6f63] transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="px-5 pb-5 space-y-4 border-t border-white/50 pt-4">
              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-[#7a6f63] mb-3">สินค้า</h4>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="glass-card-inner !rounded-[12px] p-3 flex justify-between">
                      <span className="text-[#1a1a1a] text-sm">{item.product_name} x {item.quantity}</span>
                      <span className="font-medium text-[#1a1a1a] text-sm">฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="glass-card-inner !rounded-[16px] p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6f63]">รวมสินค้า</span>
                  <span className="text-[#1a1a1a]">฿{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6f63]">ค่าส่ง</span>
                  <span className="text-[#1a1a1a]">฿{order.delivery_fee}</span>
                </div>
                {order.cod_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7a6f63]">ค่า COD</span>
                    <span className="text-[#1a1a1a]">฿{order.cod_fee}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-3 border-t border-white/50">
                  <span className="text-[#1a1a1a]">รวมทั้งหมด</span>
                  <span className="text-[#1a1a1a]">฿{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="text-sm font-medium text-[#7a6f63] mb-3">ที่อยู่จัดส่ง</h4>
                <div className="glass-card-inner !rounded-[16px] p-4 space-y-1">
                  <p className="font-semibold text-[#1a1a1a]">{order.buyer_name}</p>
                  <p className="text-sm text-[#7a6f63]">{order.buyer_phone}</p>
                  <p className="text-sm text-[#7a6f63]">{order.buyer_address}</p>
                  {order.buyer_notes && (
                    <p className="text-sm text-[#a69a8c] italic mt-2">&quot;{order.buyer_notes}&quot;</p>
                  )}
                </div>
              </div>

              {/* Scheduled Time */}
              <div>
                <h4 className="text-sm font-medium text-[#7a6f63] mb-3">เวลาจัดส่ง</h4>
                <div className="glass-card-inner !rounded-[16px] p-4 flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[#1a1a1a]">{order.scheduled_date} {order.scheduled_time}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Options */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {order.seller?.phone && (
            <a
              href={`tel:${order.seller.phone}`}
              className="flex items-center justify-center gap-2 w-full py-4 glass-card !rounded-[16px] text-[#1a1a1a] font-medium hover:bg-white/70 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              ติดต่อร้าน
            </a>
          )}

          <Link
            href={`/${shopname}`}
            className="btn-primary w-full"
          >
            กลับไปหน้าร้าน
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
