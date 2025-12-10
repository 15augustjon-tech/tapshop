'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useCheckout'

interface Props {
  params: Promise<{ shopname: string }>
}

export default function CheckoutConfirmPage({ params }: Props) {
  const { shopname } = use(params)
  const router = useRouter()
  const { items, isLoaded: cartLoaded, getSubtotal, clearCart } = useCart(shopname)
  const {
    address,
    quote,
    saveAddress,
    isLoaded: checkoutLoaded,
    clearCheckout
  } = useCheckout(shopname)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'cod'>('promptpay')

  // Redirect if no address or cart is empty
  useEffect(() => {
    if (checkoutLoaded && !address) {
      router.push(`/${shopname}/checkout`)
    }
    if (cartLoaded && items.length === 0) {
      router.push(`/${shopname}`)
    }
  }, [checkoutLoaded, cartLoaded, address, items, router, shopname])

  const handleSubmit = async () => {
    if (!address || !quote) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopSlug: shopname,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          buyerName: address.name,
          buyerPhone: address.phone,
          buyerAddress: address.address,
          buyerLat: address.lat,
          buyerLng: address.lng,
          buyerNotes: address.notes,
          saveAddress,
          paymentMethod
        })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      // Clear cart and checkout data
      clearCart()
      clearCheckout()

      // Redirect based on payment method
      if (paymentMethod === 'cod') {
        // COD: Go directly to order tracking
        router.push(`/${shopname}/order/${data.order.id}`)
      } else {
        // PromptPay: Go to payment page for QR
        router.push(`/${shopname}/order/${data.order.id}/pay`)
      }
    } catch (err) {
      console.error('Order error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  if (!cartLoaded || !checkoutLoaded || !address || !quote) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="icon-box w-16 h-16 !rounded-[20px] animate-pulse">
          <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const productTotal = subtotal // Amount to pay via PromptPay
  const deliveryFee = quote.deliveryFee // Amount to pay cash to rider

  return (
    <div className="min-h-screen bg-gradient-main pb-32 overflow-x-hidden">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass-card !rounded-[20px] overflow-hidden">
          <div className="flex items-center px-4 h-[56px] relative z-10">
            <Link
              href={`/${shopname}/checkout`}
              className="w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="flex-1 text-center font-bold text-[#1a1a1a]">ยืนยันคำสั่งซื้อ</h1>
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
              <div className="progress-step active">
                <div className="progress-step-number">2</div>
                <span className="progress-step-label">ยืนยัน</span>
              </div>
              <div className="progress-step">
                <div className="progress-step-number">3</div>
                <span className="progress-step-label">ชำระเงิน</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Error Message */}
        {error && (
          <div className="glass-card !rounded-[20px] p-4 border border-[#ef4444]/30 bg-[rgba(239,68,68,0.08)] animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-[#ef4444] font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="glass-card !rounded-[24px] p-5 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-box w-10 h-10 !rounded-[12px]">
              <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="font-bold text-[#1a1a1a]">รายการสินค้า</h2>
          </div>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.productId} className="glass-card-inner !rounded-[16px] p-3">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-gradient-to-br from-[#f0e9df] to-[#e8dfd3] flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#a69a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a1a1a] text-sm line-clamp-1">{item.name}</p>
                    <p className="text-[#7a6f63] text-sm">฿{item.price.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#1a1a1a]">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="glass-card !rounded-[24px] p-5 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-box w-10 h-10 !rounded-[12px]">
              <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="font-bold text-[#1a1a1a]">เลือกวิธีชำระเงิน</h2>
          </div>

          <div className="space-y-3">
            {/* PromptPay Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('promptpay')}
              className={`w-full text-left p-4 rounded-[16px] transition-all ${
                paymentMethod === 'promptpay'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'glass-card-inner hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'promptpay' ? 'border-white' : 'border-[#a69a8c]'
                }`}>
                  {paymentMethod === 'promptpay' && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'promptpay' ? 'bg-white/20' : 'bg-[#1E4A99]'
                }`}>
                  <svg className={`w-5 h-5 ${paymentMethod === 'promptpay' ? 'text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">PromptPay</p>
                  <p className={`text-sm ${paymentMethod === 'promptpay' ? 'text-white/70' : 'text-[#7a6f63]'}`}>
                    สแกน QR จ่ายค่าสินค้า • ค่าส่งจ่ายเงินสด
                  </p>
                </div>
              </div>
            </button>

            {/* COD Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`w-full text-left p-4 rounded-[16px] transition-all ${
                paymentMethod === 'cod'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'glass-card-inner hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'cod' ? 'border-white' : 'border-[#a69a8c]'
                }`}>
                  {paymentMethod === 'cod' && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'cod' ? 'bg-white/20' : 'bg-gradient-to-br from-[#22c55e] to-[#16a34a]'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">เก็บเงินปลายทาง (COD)</p>
                  <p className={`text-sm ${paymentMethod === 'cod' ? 'text-white/70' : 'text-[#7a6f63]'}`}>
                    จ่ายเงินสดทั้งหมดให้ไรเดอร์
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Payment Summary */}
          <div className="mt-4 pt-4 border-t border-white/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#7a6f63]">ค่าสินค้า</span>
              <span className="text-[#1a1a1a]">฿{productTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7a6f63]">ค่าส่ง</span>
              <span className="text-[#1a1a1a]">฿{deliveryFee}</span>
            </div>
            <div className="pt-2 border-t border-white/30 flex justify-between items-center">
              <span className="font-bold text-[#1a1a1a]">รวมทั้งหมด</span>
              <span className="text-2xl font-bold text-[#1a1a1a]">฿{(productTotal + deliveryFee).toLocaleString()}</span>
            </div>
            {paymentMethod === 'promptpay' && (
              <p className="text-xs text-[#7a6f63] text-center pt-2">
                ค่าสินค้า ฿{productTotal.toLocaleString()} ชำระผ่าน QR • ค่าส่ง ฿{deliveryFee} จ่ายเงินสด
              </p>
            )}
            {paymentMethod === 'cod' && (
              <p className="text-xs text-[#22c55e] text-center pt-2">
                จ่ายเงินสด ฿{(productTotal + deliveryFee).toLocaleString()} ให้ไรเดอร์เมื่อรับของ
              </p>
            )}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="glass-card !rounded-[24px] p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="icon-box w-10 h-10 !rounded-[12px]">
                <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="font-bold text-[#1a1a1a]">ที่อยู่จัดส่ง</h2>
            </div>
            <Link
              href={`/${shopname}/checkout`}
              className="text-sm text-[#7a6f63] hover:text-[#1a1a1a] transition-colors"
            >
              แก้ไข
            </Link>
          </div>
          <div className="glass-card-inner !rounded-[16px] p-4 space-y-2">
            <p className="font-semibold text-[#1a1a1a]">{address.name}</p>
            <p className="text-[#7a6f63] text-sm">{address.phone}</p>
            <p className="text-[#7a6f63] text-sm">{address.address}</p>
            {address.notes && (
              <p className="text-[#a69a8c] text-sm italic">&quot;{address.notes}&quot;</p>
            )}
          </div>
        </div>

        {/* Scheduled Delivery */}
        <div className="glass-card !rounded-[24px] p-5 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-box w-10 h-10 !rounded-[12px]">
              <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-bold text-[#1a1a1a]">เวลาจัดส่ง</h2>
          </div>
          <div className="glass-card-inner !rounded-[16px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <span className="font-medium text-[#1a1a1a]">{quote.deliverySlotFull}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 safe-area-bottom">
        <div className="glass-card !rounded-[20px] p-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังสร้างออเดอร์...
              </span>
            ) : (
              <>
                {paymentMethod === 'cod' ? 'ยืนยันคำสั่งซื้อ' : 'ยืนยันและไปชำระเงิน'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
