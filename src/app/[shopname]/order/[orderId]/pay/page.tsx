'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ shopname: string; orderId: string }>
}

interface Order {
  id: string
  order_number: string
  status: string
  subtotal: number
  delivery_fee: number
  total: number
  seller: {
    shop_name: string
    shop_slug: string
    promptpay_id: string | null
  }
}

export default function PaymentPage({ params }: Props) {
  const { shopname, orderId } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const handleCopyPromptPay = async () => {
    if (!order?.seller?.promptpay_id) return
    try {
      await navigator.clipboard.writeText(order.seller.promptpay_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleConfirmPayment = async () => {
    setConfirming(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: 'POST'
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      // Redirect to order success page
      router.push(`/${shopname}/order/${orderId}`)
    } catch (err) {
      console.error('Confirm payment error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setConfirming(false)
    }
  }

  // Generate PromptPay QR code URL using a free service
  const getPromptPayQRUrl = (promptpayId: string, amount: number) => {
    // Using promptpay.io for QR generation
    return `https://promptpay.io/${promptpayId}/${amount}.png`
  }

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

  const productAmount = order.subtotal // Amount to pay via PromptPay
  const hasPromptPay = order.seller?.promptpay_id

  return (
    <div className="min-h-screen bg-gradient-main pb-20 overflow-x-hidden">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass-card !rounded-[20px] overflow-hidden">
          <div className="flex items-center px-4 h-[56px] relative z-10">
            <div className="w-10" />
            <h1 className="flex-1 text-center font-bold text-[#1a1a1a]">ชำระเงิน</h1>
            <div className="w-10" />
          </div>

          {/* Progress Steps */}
          <div className="px-4 pb-4">
            <div className="progress-steps">
              <div className="progress-step completed">
                <div className="progress-step-number">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="progress-step-label">ที่อยู่</span>
              </div>
              <div className="progress-step completed">
                <div className="progress-step-number">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="progress-step-label">ยืนยัน</span>
              </div>
              <div className="progress-step active">
                <div className="progress-step-number">3</div>
                <span className="progress-step-label">ชำระเงิน</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Order Number */}
        <div className="glass-card !rounded-[24px] p-5 text-center animate-fade-in">
          <p className="text-[#7a6f63] text-sm mb-1">หมายเลขคำสั่งซื้อ</p>
          <p className="font-bold text-xl text-[#1a1a1a]">{order.order_number}</p>
        </div>

        {/* PromptPay QR Code */}
        {hasPromptPay ? (
          <div className="glass-card !rounded-[24px] p-6 text-center animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-[10px] bg-[#1E4A99] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h2 className="font-bold text-lg text-[#1a1a1a]">PromptPay</h2>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-[20px] inline-block mb-4 shadow-lg">
              <Image
                src={getPromptPayQRUrl(order.seller.promptpay_id!, productAmount)}
                alt="PromptPay QR Code"
                width={200}
                height={200}
                className="rounded-lg"
                unoptimized
              />
            </div>

            {/* Amount */}
            <div className="glass-card-inner !rounded-[16px] p-4 mb-4">
              <p className="text-[#7a6f63] text-sm mb-1">ยอดชำระค่าสินค้า</p>
              <p className="text-3xl font-bold text-[#1a1a1a]">฿{productAmount.toLocaleString()}</p>
            </div>

            {/* PromptPay ID */}
            <div className="flex items-center justify-between glass-card-inner !rounded-[16px] p-4">
              <div className="text-left">
                <p className="text-[#7a6f63] text-sm">พร้อมเพย์</p>
                <p className="font-semibold text-[#1a1a1a] font-mono tracking-wider">{order.seller.promptpay_id}</p>
              </div>
              <button
                onClick={handleCopyPromptPay}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  copied
                    ? 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white'
                    : 'glass-card-inner hover:bg-white/60'
                }`}
              >
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-left">
              <p className="text-[#7a6f63] text-sm mb-2">วิธีชำระเงิน:</p>
              <ol className="text-[#7a6f63] text-sm space-y-1 list-decimal list-inside">
                <li>เปิดแอปธนาคารของคุณ</li>
                <li>เลือก &quot;สแกน QR&quot;</li>
                <li>สแกน QR Code ด้านบน</li>
                <li>ตรวจสอบยอดเงินและกด &quot;ยืนยัน&quot;</li>
              </ol>
            </div>
          </div>
        ) : (
          /* No PromptPay - Show message */
          <div className="glass-card !rounded-[24px] p-6 text-center animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="icon-box w-16 h-16 !rounded-[20px] mx-auto mb-4">
              <svg className="w-8 h-8 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-bold text-lg text-[#1a1a1a] mb-2">ร้านยังไม่ตั้งค่า PromptPay</h2>
            <p className="text-[#7a6f63] text-sm mb-4">กรุณาติดต่อร้านค้าเพื่อสอบถามวิธีชำระเงิน</p>
            <div className="glass-card-inner !rounded-[16px] p-4">
              <p className="text-[#7a6f63] text-sm mb-1">ยอดค่าสินค้า</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">฿{productAmount.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Delivery Fee Reminder */}
        <div className="glass-card !rounded-[24px] p-5 border border-[#22c55e]/30 bg-[rgba(34,197,94,0.05)] animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a] mb-1">ค่าส่ง ฿{order.delivery_fee}</p>
              <p className="text-[#7a6f63] text-sm">จ่ายเงินสดให้ไรเดอร์เมื่อรับของ</p>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="glass-card !rounded-[24px] p-5 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#7a6f63]">ค่าสินค้า (PromptPay)</span>
              <span className="text-[#1a1a1a]">฿{productAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7a6f63]">ค่าส่ง (เงินสด)</span>
              <span className="text-[#1a1a1a]">฿{order.delivery_fee}</span>
            </div>
            <div className="pt-3 border-t border-white/50 flex justify-between">
              <span className="font-bold text-[#1a1a1a]">รวมทั้งหมด</span>
              <span className="text-2xl font-bold text-[#1a1a1a]">฿{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 safe-area-bottom">
        <div className="glass-card !rounded-[20px] p-4">
          <button
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="btn-green w-full"
          >
            {confirming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังยืนยัน...
              </span>
            ) : (
              <>
                ฉันโอนเงินแล้ว
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
          <p className="text-center text-[#7a6f63] text-xs mt-3">กดยืนยันหลังจากโอนเงินเรียบร้อยแล้ว</p>
        </div>
      </div>
    </div>
  )
}
