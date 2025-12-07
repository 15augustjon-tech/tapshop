'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
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
  { key: 'pending', label: 'รอยืนยัน' },
  { key: 'confirmed', label: 'ยืนยันแล้ว' },
  { key: 'preparing', label: 'รอร้านเตรียมของ' },
  { key: 'dispatched', label: 'ไรเดอร์รับของแล้ว' },
  { key: 'picked_up', label: 'กำลังจัดส่ง' },
  { key: 'delivered', label: 'ส่งแล้ว' }
]

function getStatusIndex(status: string): number {
  const index = STATUS_STEPS.findIndex(s => s.key === status)
  return index >= 0 ? index : 0
}

export default function OrderSuccessPage({ params }: Props) {
  const { shopname, orderId } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-[5%]">
        <div className="text-center">
          <p className="text-error mb-4">{error || 'ไม่พบคำสั่งซื้อ'}</p>
          <Link
            href={`/${shopname}`}
            className="text-black font-medium hover:underline"
          >
            กลับไปหน้าร้าน
          </Link>
        </div>
      </div>
    )
  }

  const statusIndex = getStatusIndex(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-border z-10">
        <div className="flex items-center px-[5%] h-14">
          <Link
            href={`/${shopname}`}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center font-bold">คำสั่งซื้อ</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-[5%] py-6 max-w-md mx-auto">
        {/* Success Banner */}
        {order.status === 'pending' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">สั่งซื้อสำเร็จ!</h2>
            <p className="text-secondary mb-4">หมายเลขคำสั่งซื้อ: {order.order_number}</p>
            <div className="inline-block bg-black text-white px-6 py-3 rounded-lg">
              <p className="text-sm opacity-80">ชำระเงินให้ไรเดอร์</p>
              <p className="text-2xl font-bold">฿{order.total.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Order Number (for non-pending states) */}
        {order.status !== 'pending' && (
          <div className="mb-6">
            <p className="text-secondary text-sm">หมายเลขคำสั่งซื้อ</p>
            <p className="font-bold text-lg">{order.order_number}</p>
          </div>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="mb-8">
            <h3 className="font-bold mb-4">สถานะการจัดส่ง</h3>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= statusIndex
                const isCurrent = index === statusIndex

                return (
                  <div key={step.key} className="flex">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-success text-white'
                            : 'bg-neutral-200 text-neutral-400'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            index < statusIndex ? 'bg-success' : 'bg-neutral-200'
                          }`}
                        />
                      )}
                    </div>
                    {/* Step label */}
                    <div className="pb-8">
                      <p
                        className={`font-medium ${
                          isCurrent ? 'text-black' : isCompleted ? 'text-success' : 'text-secondary'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <p className="font-medium text-error">คำสั่งซื้อถูกยกเลิก</p>
          </div>
        )}

        {/* Driver Info */}
        {order.delivery && order.delivery.driver_name && (
          <div className="mb-6 p-4 border border-border rounded-lg">
            <h3 className="font-bold mb-3">ข้อมูลไรเดอร์</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">ชื่อ</span>
                <span>{order.delivery.driver_name}</span>
              </div>
              {order.delivery.driver_phone && (
                <div className="flex justify-between">
                  <span className="text-secondary">เบอร์โทร</span>
                  <a
                    href={`tel:${order.delivery.driver_phone}`}
                    className="text-black font-medium hover:underline"
                  >
                    {order.delivery.driver_phone}
                  </a>
                </div>
              )}
              {order.delivery.vehicle_plate && (
                <div className="flex justify-between">
                  <span className="text-secondary">ทะเบียนรถ</span>
                  <span>{order.delivery.vehicle_plate}</span>
                </div>
              )}
              {order.delivery.tracking_url && (
                <a
                  href={order.delivery.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-center py-2 border border-black rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  ติดตามไรเดอร์
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Details (Collapsible) */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between py-3 border-b border-border"
          >
            <span className="font-bold">รายละเอียดคำสั่งซื้อ</span>
            <svg
              className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="pt-4 space-y-4">
              {/* Items */}
              <div>
                <h4 className="text-sm text-secondary mb-2">สินค้า</h4>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-border space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">รวมสินค้า</span>
                  <span>฿{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">ค่าส่ง</span>
                  <span>฿{order.delivery_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">ค่า COD</span>
                  <span>฿{order.cod_fee}</span>
                </div>
                <div className="flex justify-between font-bold pt-2">
                  <span>รวมทั้งหมด</span>
                  <span>฿{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="pt-2 border-t border-border">
                <h4 className="text-sm text-secondary mb-2">ที่อยู่จัดส่ง</h4>
                <p className="text-sm font-medium">{order.buyer_name}</p>
                <p className="text-sm text-secondary">{order.buyer_phone}</p>
                <p className="text-sm text-secondary">{order.buyer_address}</p>
                {order.buyer_notes && (
                  <p className="text-sm text-secondary italic mt-1">"{order.buyer_notes}"</p>
                )}
              </div>

              {/* Scheduled Time */}
              <div className="pt-2 border-t border-border">
                <h4 className="text-sm text-secondary mb-1">เวลาจัดส่งที่กำหนด</h4>
                <p className="text-sm">{order.scheduled_date} {order.scheduled_time}</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          {order.seller?.phone && (
            <a
              href={`tel:${order.seller.phone}`}
              className="flex items-center justify-center gap-2 w-full py-3 border border-black rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              ติดต่อร้าน
            </a>
          )}

          <Link
            href={`/${shopname}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            กลับไปหน้าร้าน
          </Link>
        </div>
      </div>
    </div>
  )
}
