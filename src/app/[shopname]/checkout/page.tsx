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
  const { items, isLoaded: cartLoaded, getSubtotal } = useCart(shopname)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-24">
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
          <h1 className="flex-1 text-center font-bold">ที่อยู่จัดส่ง</h1>
          <div className="w-10" />
        </div>
        {/* Progress */}
        <div className="flex px-[5%] pb-3">
          <div className="flex-1 h-1 bg-black rounded-full mr-1" />
          <div className="flex-1 h-1 bg-neutral-200 rounded-full ml-1" />
        </div>
      </header>

      <div className="px-[5%] py-6 max-w-md mx-auto">
        {/* Step 1: Phone Input (if not done) */}
        {!phoneLookupDone && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">ใส่เบอร์โทรเพื่อเริ่มสั่งซื้อ</h2>
              <p className="text-secondary text-sm">ถ้าเคยสั่งซื้อแล้ว เราจะดึงที่อยู่ให้อัตโนมัติ</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full px-4 py-4 text-lg border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 text-center"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handlePhoneLookup}
              disabled={!/^0\d{9}$/.test(phoneInput.replace(/[^0-9]/g, '')) || phoneLookupLoading}
              className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            >
              {phoneLookupLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังตรวจสอบ...
                </span>
              ) : (
                'ถัดไป'
              )}
            </button>
          </div>
        )}

        {/* Step 2: Address Form (after phone lookup) */}
        {phoneLookupDone && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Returning buyer welcome */}
            {isReturningBuyer && (
              <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg mb-4">
                <p className="font-medium">ยินดีต้อนรับกลับ{buyerName ? `, ${buyerName}` : ''}!</p>
                <p className="text-sm opacity-80">เลือกที่อยู่ที่เคยบันทึกไว้ หรือใส่ที่อยู่ใหม่</p>
              </div>
            )}

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">ที่อยู่ที่บันทึกไว้</label>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full text-left p-3 border rounded-lg transition-all ${
                        address === addr.address && lat === addr.lat
                          ? 'border-black bg-neutral-50'
                          : 'border-border hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0">
                          {address === addr.address && lat === addr.lat && (
                            <div className="w-3 h-3 bg-black rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{addr.label}</p>
                          <p className="text-sm text-secondary truncate">{addr.name} - {addr.phone}</p>
                          <p className="text-sm text-secondary truncate">{addr.address}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-secondary">หรือใส่ที่อยู่ใหม่</span>
                  </div>
                </div>
              </div>
            )}

            {/* Phone (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-2">เบอร์โทร</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  readOnly
                  className="flex-1 px-4 py-3 border border-border rounded-lg bg-neutral-50 text-secondary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoneLookupDone(false)
                    setSavedAddresses([])
                    setIsReturningBuyer(false)
                  }}
                  className="px-4 py-3 text-sm border border-border rounded-lg hover:bg-neutral-50"
                >
                  เปลี่ยน
                </button>
              </div>
            </div>

            {/* Recipient Name */}
            <div>
              <label className="block text-sm font-medium mb-2">ชื่อผู้รับ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-2">ที่อยู่</label>
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
                  className="flex-1 px-4 py-3 border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={!address.trim()}
                  className="px-4 py-3 bg-black text-white rounded-lg disabled:opacity-50 hover:bg-neutral-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-xs text-secondary">กดปุ่มค้นหาเพื่อตรวจสอบที่อยู่</p>
            </div>

            {/* Map placeholder */}
            {lat !== null && lng !== null && (
              <div className="h-40 bg-neutral-100 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center text-secondary">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">พิกัด: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                </div>
              </div>
            )}

            {/* Delivery Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">หมายเหตุถึงไรเดอร์ (ไม่บังคับ)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น โทรเมื่อถึง, วางหน้าประตู"
                className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
              />
            </div>

            {/* Delivery Quote Box */}
            <div className="p-4 bg-neutral-50 rounded-lg border border-border">
              <h3 className="font-medium mb-3">ข้อมูลการจัดส่ง</h3>

              {quoteLoading && (
                <div className="flex items-center gap-2 text-secondary">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>กำลังคำนวณ...</span>
                </div>
              )}

              {quoteError && (
                <div className="text-error">
                  <p>{quoteError}</p>
                </div>
              )}

              {deliveryQuote && !quoteError && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">ระยะทาง</span>
                    <span>{deliveryQuote.distance} กม.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">ค่าส่ง</span>
                    <span className="font-semibold">฿{deliveryQuote.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">จัดส่ง</span>
                    <span>{deliveryQuote.deliverySlotFull}</span>
                  </div>
                </div>
              )}

              {!quoteLoading && !quoteError && !deliveryQuote && (
                <p className="text-secondary text-sm">กรุณาค้นหาที่อยู่เพื่อคำนวณค่าส่ง</p>
              )}
            </div>

            {/* Save Address Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAddressChecked}
                onChange={(e) => setSaveAddressChecked(e.target.checked)}
                className="w-5 h-5 rounded border-border"
              />
              <span>บันทึกที่อยู่นี้สำหรับครั้งหน้า</span>
            </label>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-[5%] py-4 safe-area-bottom">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
              >
                ถัดไป
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
