'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
          saveAddress
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

      // Redirect to success page
      router.push(`/${shopname}/order/${data.order.id}`)
    } catch (err) {
      console.error('Order error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  if (!cartLoaded || !checkoutLoaded || !address || !quote) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const subtotal = getSubtotal()
  const total = subtotal + quote.deliveryFee + quote.codFee

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-border z-10">
        <div className="flex items-center px-[5%] h-14">
          <Link
            href={`/${shopname}/checkout`}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center font-bold">ยืนยันคำสั่งซื้อ</h1>
          <div className="w-10" />
        </div>
        {/* Progress */}
        <div className="flex px-[5%] pb-3">
          <div className="flex-1 h-1 bg-black rounded-full mr-1" />
          <div className="flex-1 h-1 bg-black rounded-full ml-1" />
        </div>
      </header>

      <div className="px-[5%] py-6 max-w-md mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-error rounded-lg">
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-6">
          <h2 className="font-bold mb-4">รายการสินค้า</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="flex-1">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">รวมสินค้า</span>
            <span>฿{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">ค่าส่ง</span>
            <span>฿{quote.deliveryFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">ค่าบริการเก็บเงินปลายทาง</span>
            <span>฿{quote.codFee}</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="font-bold">ยอดชำระ</span>
            <span className="text-xl font-bold">฿{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">ที่อยู่จัดส่ง</h2>
            <Link
              href={`/${shopname}/checkout`}
              className="text-sm text-secondary hover:underline"
            >
              แก้ไข
            </Link>
          </div>
          <div className="p-4 border border-border rounded-lg space-y-1 text-sm">
            <p className="font-medium">{address.name}</p>
            <p className="text-secondary">{address.phone}</p>
            <p className="text-secondary">{address.address}</p>
            {address.notes && (
              <p className="text-secondary italic">"{address.notes}"</p>
            )}
          </div>
        </div>

        {/* Scheduled Delivery */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">เวลาจัดส่ง</h2>
          <div className="p-4 border border-border rounded-lg flex items-center gap-3">
            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{quote.deliverySlotFull}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">วิธีชำระเงิน</h2>
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">เก็บเงินปลายทาง (COD)</span>
            </div>
            <p className="text-sm text-secondary">
              ชำระเงินสดให้ไรเดอร์เมื่อได้รับสินค้า
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-[5%] py-4 safe-area-bottom">
        <button
          onClick={() => {
            // Confirm before submitting high-value order
            if (confirm(`ยืนยันสั่งซื้อ ฿${total.toLocaleString()} ใช่หรือไม่?`)) {
              handleSubmit()
            }
          }}
          disabled={submitting}
          className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังสั่งซื้อ...
            </span>
          ) : (
            'ยืนยันคำสั่งซื้อ'
          )}
        </button>
      </div>
    </div>
  )
}
