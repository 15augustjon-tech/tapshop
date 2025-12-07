'use client'

import { useState } from 'react'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  product_price: number
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  customer_address: string
  delivery_notes?: string
  subtotal: number
  total: number
  scheduled_date?: string
  scheduled_time?: string
  created_at: string
  order_items: OrderItem[]
}

interface OrderCardProps {
  order: Order
  onStatusChange?: (orderId: string, newStatus: string) => void
}

const STATUS_CONFIG = {
  pending: { label: 'รอยืนยัน', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { label: 'ยืนยันแล้ว', bg: 'bg-blue-100', text: 'text-blue-800' },
  shipping: { label: 'กำลังส่ง', bg: 'bg-orange-100', text: 'text-orange-800' },
  delivered: { label: 'ส่งแล้ว', bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { label: 'ยกเลิก', bg: 'bg-red-100', text: 'text-red-800' }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'เมื่อกี้'
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`
  return date.toLocaleDateString('th-TH')
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH').format(amount)
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false)
  const statusConfig = STATUS_CONFIG[order.status]

  // Get first item for preview
  const firstItem = order.order_items?.[0]
  const itemCount = order.order_items?.length || 0
  const totalQty = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  // Get first name only
  const firstName = order.customer_name?.split(' ')[0] || 'ลูกค้า'

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Main card - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-neutral-50 transition-colors"
      >
        {/* Top row: Order ID + Status */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm">{order.order_number}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Product info */}
        <p className="font-medium mb-1">
          {firstItem?.product_name || 'สินค้า'}
          {itemCount > 1 ? ` และอีก ${itemCount - 1} รายการ` : ''}
          {' '}x {totalQty}
        </p>

        {/* Price + Customer + Time */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">฿{formatCurrency(order.total)}</span>
          <span className="text-secondary">{firstName} • {formatRelativeTime(order.created_at)}</span>
        </div>

        {/* Expand indicator */}
        <div className="flex justify-center mt-2">
          <svg
            className={`w-5 h-5 text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border p-4 bg-neutral-50 space-y-4">
          {/* Order items */}
          <div>
            <p className="text-sm font-medium mb-2">รายการสั่งซื้อ</p>
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span>{item.product_name} x {item.quantity}</span>
                <span>฿{formatCurrency(item.product_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-medium pt-2 border-t border-border mt-2">
              <span>รวม</span>
              <span>฿{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Customer info */}
          <div>
            <p className="text-sm font-medium mb-2">ข้อมูลลูกค้า</p>
            <p className="text-sm">{order.customer_name}</p>
            <a
              href={`tel:${order.customer_phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {order.customer_phone}
            </a>
            <p className="text-sm text-secondary mt-1">{order.customer_address}</p>
            {order.delivery_notes && (
              <p className="text-sm text-secondary mt-1">
                <span className="font-medium">หมายเหตุ:</span> {order.delivery_notes}
              </p>
            )}
          </div>

          {/* Scheduled delivery */}
          {order.scheduled_date && (
            <div>
              <p className="text-sm font-medium mb-1">กำหนดส่ง</p>
              <p className="text-sm">{order.scheduled_date} {order.scheduled_time}</p>
            </div>
          )}

          {/* Action buttons based on status */}
          {order.status === 'pending' && onStatusChange && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onStatusChange(order.id, 'confirmed')}
                className="flex-1 py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                ยืนยันออเดอร์
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'cancelled')}
                className="px-4 py-3 border border-border rounded-lg hover:bg-white transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {order.status === 'confirmed' && onStatusChange && (
            <button
              onClick={() => onStatusChange(order.id, 'shipping')}
              className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              เริ่มจัดส่ง
            </button>
          )}
        </div>
      )}
    </div>
  )
}
