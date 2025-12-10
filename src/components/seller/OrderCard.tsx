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
  pending: { label: 'รอยืนยัน', bg: 'bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/10', text: 'text-[#b45309]', border: 'border-[#f59e0b]/30' },
  confirmed: { label: 'ยืนยันแล้ว', bg: 'bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/10', text: 'text-[#1d4ed8]', border: 'border-[#3b82f6]/30' },
  shipping: { label: 'กำลังส่ง', bg: 'bg-gradient-to-r from-[#f97316]/20 to-[#f97316]/10', text: 'text-[#c2410c]', border: 'border-[#f97316]/30' },
  delivered: { label: 'ส่งแล้ว', bg: 'bg-gradient-to-r from-[#22c55e]/20 to-[#22c55e]/10', text: 'text-[#15803d]', border: 'border-[#22c55e]/30' },
  cancelled: { label: 'ยกเลิก', bg: 'bg-gradient-to-r from-[#ef4444]/20 to-[#ef4444]/10', text: 'text-[#b91c1c]', border: 'border-[#ef4444]/30' }
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
    <div className="glass-card !rounded-[20px] overflow-hidden">
      {/* Main card - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-white/30 transition-colors"
      >
        {/* Top row: Order ID + Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm text-[#7a6f63]">{order.order_number}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Product info */}
        <p className="font-semibold text-[#1a1a1a] mb-1.5">
          {firstItem?.product_name || 'สินค้า'}
          {itemCount > 1 ? ` และอีก ${itemCount - 1} รายการ` : ''}
          {' '}x {totalQty}
        </p>

        {/* Price + Customer + Time */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-lg text-[#1a1a1a]">฿{formatCurrency(order.total)}</span>
          <span className="text-[#7a6f63]">{firstName} • {formatRelativeTime(order.created_at)}</span>
        </div>

        {/* Expand indicator */}
        <div className="flex justify-center mt-3">
          <svg
            className={`w-5 h-5 text-[#a69a8c] transition-transform ${expanded ? 'rotate-180' : ''}`}
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
        <div className="border-t border-white/50 p-4 bg-white/20 space-y-4">
          {/* Order items */}
          <div className="glass-card-inner !rounded-[14px] p-4">
            <p className="text-sm font-semibold text-[#1a1a1a] mb-3">รายการสั่งซื้อ</p>
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1.5">
                <span className="text-[#1a1a1a]">{item.product_name} x {item.quantity}</span>
                <span className="font-medium text-[#1a1a1a]">฿{formatCurrency(item.product_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-3 border-t border-white/50 mt-3">
              <span className="text-[#1a1a1a]">รวม</span>
              <span className="text-[#1a1a1a]">฿{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Customer info */}
          <div className="glass-card-inner !rounded-[14px] p-4">
            <p className="text-sm font-semibold text-[#1a1a1a] mb-3">ข้อมูลลูกค้า</p>
            <p className="text-sm font-medium text-[#1a1a1a]">{order.customer_name}</p>
            <a
              href={`tel:${order.customer_phone}`}
              className="text-sm text-[#1E4A99] hover:underline inline-flex items-center gap-1 my-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {order.customer_phone}
            </a>
            <p className="text-sm text-[#7a6f63] mt-1">{order.customer_address}</p>
            {order.delivery_notes && (
              <p className="text-sm text-[#a69a8c] mt-2 italic">
                &quot;{order.delivery_notes}&quot;
              </p>
            )}
          </div>

          {/* Scheduled delivery */}
          {order.scheduled_date && (
            <div className="glass-card-inner !rounded-[14px] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#7a6f63]">กำหนดส่ง</p>
                <p className="font-medium text-[#1a1a1a]">{order.scheduled_date} {order.scheduled_time}</p>
              </div>
            </div>
          )}

          {/* Action buttons based on status */}
          {order.status === 'pending' && onStatusChange && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onStatusChange(order.id, 'confirmed')}
                className="btn-primary flex-1"
              >
                ยืนยันออเดอร์
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'cancelled')}
                className="btn-secondary !px-5"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {order.status === 'confirmed' && onStatusChange && (
            <button
              onClick={() => onStatusChange(order.id, 'shipping')}
              className="btn-primary w-full"
            >
              เริ่มจัดส่ง
            </button>
          )}
        </div>
      )}
    </div>
  )
}
