'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useCheckout'

interface SavedAddress {
  id: string
  label: string
  name: string
  phone: string
  address: string
  lat: number
  lng: number
  notes: string | null
}

interface Props {
  params: Promise<{ shopname: string }>
}

export default function CheckoutAddressPage({ params }: Props) {
  const { shopname } = use(params)
  const router = useRouter()
  const { items, isLoaded: cartLoaded } = useCart(shopname)
  const {
    address: savedAddress,
    quote: savedQuote,
    saveAddress: savedSaveAddress,
    isLoaded: checkoutLoaded,
    setAddress,
    setQuote,
    setSaveAddress
  } = useCheckout(shopname)

  // Phone lookup state
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneLookupDone, setPhoneLookupDone] = useState(false)
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [isReturningBuyer, setIsReturningBuyer] = useState(false)
  const [buyerName, setBuyerName] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddressText] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [saveAddressChecked, setSaveAddressChecked] = useState(true)

  // Quote state
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [deliveryQuote, setDeliveryQuote] = useState<{
    distance: number
    deliveryFee: number
    codFee: number
    deliveryDate: string
    deliveryTime: string
    deliverySlotFull: string
  } | null>(null)

  // Load saved data from previous checkout session
  useEffect(() => {
    if (checkoutLoaded && savedAddress) {
      setPhoneInput(savedAddress.phone)
      setPhone(savedAddress.phone)
      setName(savedAddress.name)
      setAddressText(savedAddress.address)
      setLat(savedAddress.lat)
      setLng(savedAddress.lng)
      setNotes(savedAddress.notes)
      setSaveAddressChecked(savedSaveAddress)
      setPhoneLookupDone(true)
      if (savedQuote) {
        setDeliveryQuote(savedQuote)
      }
    }
  }, [checkoutLoaded, savedAddress, savedQuote, savedSaveAddress])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartLoaded && items.length === 0) {
      router.push(`/${shopname}`)
    }
  }, [cartLoaded, items, router, shopname])

  // Fetch delivery quote when coordinates change
  useEffect(() => {
    if (lat !== null && lng !== null) {
      fetchQuote(lat, lng)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, shopname])

  // Phone lookup
  const handlePhoneLookup = async () => {
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '')
    if (!/^0\d{9}$/.test(cleanPhone)) {
      return
    }

    setPhoneLookupLoading(true)
    try {
      const res = await fetch('/api/buyers/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      })
      const data = await res.json()

      if (data.success) {
        setPhone(cleanPhone)
        setPhoneLookupDone(true)

        if (!data.isNew && data.buyer) {
          // Returning buyer
          setIsReturningBuyer(true)
          setBuyerName(data.buyer.name || '')
          if (data.buyer.name) {
            setName(data.buyer.name)
          }
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses)
          }
        } else {
          // New buyer
          setIsReturningBuyer(false)
        }
      }
    } catch (err) {
      console.error('Phone lookup error:', err)
    } finally {
      setPhoneLookupLoading(false)
    }
  }

  // Select saved address
  const handleSelectAddress = (addr: SavedAddress) => {
    setName(addr.name)
    setAddressText(addr.address)
    setLat(addr.lat)
    setLng(addr.lng)
    setNotes(addr.notes || '')
  }

  const fetchQuote = async (latitude: number, longitude: number) => {
    setQuoteLoading(true)
    setQuoteError('')
    setDeliveryQuote(null)

    try {
      const res = await fetch(
        `/api/shops/${shopname}/delivery-quote?lat=${latitude}&lng=${longitude}`
      )
      const data = await res.json()

      if (!data.success) {
        setQuoteError(data.message || 'ไม่สามารถคำนวณค่าส่งได้')
        return
      }

      setDeliveryQuote(data.quote)
    } catch (err) {
      console.error('Quote error:', err)
      setQuoteError('เกิดข้อผิดพลาด')
    } finally {
      setQuoteLoading(false)
    }
  }

  // Simulate address selection (MVP without Google Places)
  const handleAddressSearch = () => {
    if (address.trim()) {
      // Bangkok center coordinates as default
      setLat(13.7563)
      setLng(100.5018)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !phone.trim() || !address.trim() || lat === null || lng === null) {
      return
    }

    if (!deliveryQuote) {
      return
    }

    // Save to checkout context
    setAddress({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      lat,
      lng,
      notes: notes.trim()
    })
    setQuote(deliveryQuote)
    setSaveAddress(saveAddressChecked)

    // Navigate to confirm page
    router.push(`/${shopname}/checkout/confirm`)
  }

  const isFormValid =
    name.trim() !== '' &&
    phone.trim() !== '' &&
    address.trim() !== '' &&
    lat !== null &&
    lng !== null &&
    deliveryQuote !== null &&
    !quoteLoading

  if (!cartLoaded || !checkoutLoaded) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="icon-box w-16 h-16 !rounded-[20px] animate-pulse">
          <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main pb-20 overflow-x-hidden">
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
            <h1 className="flex-1 text-center font-bold text-[#1a1a1a]">ที่อยู่จัดส่ง</h1>
            <div className="w-10" />
          </div>

          {/* Progress Steps */}
          <div className="px-4 pb-4">
            <div className="progress-steps">
              <div className="progress-step active">
                <div className="progress-step-number">1</div>
                <span className="progress-step-label">ที่อยู่</span>
              </div>
              <div className="progress-step">
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

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Step 1: Phone Input (if not done) */}
        {!phoneLookupDone && (
          <div className="glass-card !rounded-[24px] p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="icon-box w-16 h-16 !rounded-[20px] mx-auto mb-4">
                <svg className="w-8 h-8 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">ใส่เบอร์โทรเพื่อเริ่มสั่งซื้อ</h2>
              <p className="text-[#7a6f63] text-sm">ถ้าเคยสั่งซื้อแล้ว เราจะดึงที่อยู่ให้อัตโนมัติ</p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="input-field text-center text-lg tracking-wider"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handlePhoneLookup}
              disabled={!/^0\d{9}$/.test(phoneInput.replace(/[^0-9]/g, '')) || phoneLookupLoading}
              className="btn-primary w-full"
            >
              {phoneLookupLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังตรวจสอบ...
                </span>
              ) : (
                <>
                  ถัดไป
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Address Form (after phone lookup) */}
        {phoneLookupDone && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            {/* Returning buyer welcome */}
            {isReturningBuyer && (
              <div className="glass-card !rounded-[20px] p-4 border border-[#22c55e]/30 bg-[rgba(34,197,94,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">ยินดีต้อนรับกลับ{buyerName ? ` ${buyerName}` : ''}!</p>
                    <p className="text-sm text-[#7a6f63]">เลือกที่อยู่ที่เคยบันทึกไว้ หรือใส่ที่อยู่ใหม่</p>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="glass-card !rounded-[24px] p-5">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">ที่อยู่ที่บันทึกไว้</label>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = address === addr.address && lat === addr.lat
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={`w-full text-left p-4 rounded-[16px] transition-all ${
                          isSelected
                            ? 'bg-[#1a1a1a] text-white shadow-lg'
                            : 'glass-card-inner hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-white' : 'border-[#a69a8c]'
                          }`}>
                            {isSelected && (
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{addr.label}</p>
                            <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#7a6f63]'}`}>
                              {addr.name} • {addr.phone}
                            </p>
                            <p className={`text-sm line-clamp-2 ${isSelected ? 'text-white/70' : 'text-[#a69a8c]'}`}>
                              {addr.address}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/50"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="glass-card-inner px-4 py-1 text-sm text-[#7a6f63] !rounded-full">หรือใส่ที่อยู่ใหม่</span>
                  </div>
                </div>
              </div>
            )}

            {/* Main Form Card */}
            <div className="glass-card !rounded-[24px] p-5 space-y-4">
              {/* Phone (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">เบอร์โทร</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    readOnly
                    className="flex-1 input-field !bg-white/30 text-[#7a6f63]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneLookupDone(false)
                      setSavedAddresses([])
                      setIsReturningBuyer(false)
                    }}
                    className="btn-secondary !py-3 !px-5"
                  >
                    เปลี่ยน
                  </button>
                </div>
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">ชื่อผู้รับ</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อ-นามสกุล"
                  className="input-field"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">ที่อยู่</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddressText(e.target.value)
                      setLat(null)
                      setLng(null)
                      setDeliveryQuote(null)
                    }}
                    placeholder="บ้านเลขที่, ซอย, ถนน, แขวง, เขต"
                    className="flex-1 input-field"
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    disabled={!address.trim()}
                    className="btn-primary !py-3 !px-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#a69a8c]">กดปุ่มค้นหาเพื่อตรวจสอบที่อยู่</p>
              </div>

              {/* Map placeholder */}
              {lat !== null && lng !== null && (
                <div className="h-32 glass-card-inner !rounded-[16px] flex items-center justify-center">
                  <div className="text-center text-[#7a6f63]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-[#1a1a1a]">พิกัดถูกต้อง</p>
                    <p className="text-xs text-[#a69a8c]">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                  </div>
                </div>
              )}

              {/* Delivery Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">หมายเหตุถึงไรเดอร์ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น โทรเมื่อถึง, วางหน้าประตู"
                  className="input-field"
                />
              </div>
            </div>

            {/* Delivery Quote Box */}
            <div className="glass-card !rounded-[24px] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-box w-10 h-10 !rounded-[12px]">
                  <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#1a1a1a]">ข้อมูลการจัดส่ง</h3>
              </div>

              {quoteLoading && (
                <div className="glass-card-inner !rounded-[16px] p-4">
                  <div className="flex items-center gap-3 text-[#7a6f63]">
                    <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                    <span>กำลังคำนวณค่าส่ง...</span>
                  </div>
                </div>
              )}

              {quoteError && (
                <div className="glass-card-inner !rounded-[16px] p-4 border border-[#ef4444]/30 bg-[rgba(239,68,68,0.08)]">
                  <p className="text-[#ef4444] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {quoteError}
                  </p>
                </div>
              )}

              {deliveryQuote && !quoteError && (
                <div className="glass-card-inner !rounded-[16px] p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7a6f63]">ระยะทาง</span>
                    <span className="font-medium text-[#1a1a1a]">{deliveryQuote.distance} กม.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7a6f63]">ค่าส่ง</span>
                    <span className="font-bold text-[#1a1a1a]">฿{deliveryQuote.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7a6f63]">จัดส่ง</span>
                    <span className="font-medium text-[#1a1a1a]">{deliveryQuote.deliverySlotFull}</span>
                  </div>
                </div>
              )}

              {!quoteLoading && !quoteError && !deliveryQuote && (
                <div className="glass-card-inner !rounded-[16px] p-4">
                  <p className="text-[#a69a8c] text-sm text-center">กรุณาค้นหาที่อยู่เพื่อคำนวณค่าส่ง</p>
                </div>
              )}
            </div>

            {/* Save Address Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer min-h-[56px] py-3 px-5 glass-card !rounded-[16px]">
              <div className={`w-6 h-6 rounded-[8px] border-2 flex items-center justify-center transition-all ${
                saveAddressChecked
                  ? 'bg-[#1a1a1a] border-[#1a1a1a]'
                  : 'border-[#a69a8c] bg-white/30'
              }`}>
                {saveAddressChecked && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={saveAddressChecked}
                onChange={(e) => setSaveAddressChecked(e.target.checked)}
                className="sr-only"
              />
              <span className="text-[#1a1a1a] font-medium">บันทึกที่อยู่นี้สำหรับครั้งหน้า</span>
            </label>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 safe-area-bottom">
              <div className="glass-card !rounded-[20px] p-4">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="btn-primary w-full"
                >
                  ถัดไป
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
