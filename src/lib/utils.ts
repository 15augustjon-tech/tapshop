// Format Thai Baht currency
export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`
}

// Format Thai phone number for display
export function formatThaiPhone(phone: string): string {
  // Input: +66812345678
  // Output: 081-234-5678
  const local = phone.replace('+66', '0')
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`
}

// Convert local Thai number to international format
export function toInternationalPhone(phone: string): string {
  // Remove all non-digits first
  const digits = phone.replace(/\D/g, '')

  // If starts with 0, replace with +66
  if (digits.startsWith('0')) {
    return '+66' + digits.slice(1)
  }

  // If starts with 66, add +
  if (digits.startsWith('66')) {
    return '+' + digits
  }

  // If already has +66
  if (phone.startsWith('+66')) {
    return phone
  }

  return '+66' + digits
}

// Generate order number (client-side placeholder, real one uses DB function)
export function generateOrderNumber(num: number): string {
  return `TPS-${num.toString().padStart(4, '0')}`
}

// Check if time is within operating hours (8am - 9pm Bangkok)
export function isWithinOperatingHours(): boolean {
  const now = new Date()
  const bangkokTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
  const hour = bangkokTime.getHours()
  return hour >= 8 && hour < 21
}

// Get next available delivery slots
export function getDeliverySlots(shippingDays: number[], shippingTime: string): Date[] {
  const slots: Date[] = []
  const now = new Date()
  const bangkokNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))

  // Look at next 7 days
  for (let i = 1; i <= 7; i++) {
    const date = new Date(bangkokNow)
    date.setDate(date.getDate() + i)

    const dayOfWeek = date.getDay()
    // Convert Sunday=0 to 7, others stay same (Mon=1, Tue=2, etc.)
    const dayNum = dayOfWeek === 0 ? 7 : dayOfWeek

    if (shippingDays.includes(dayNum)) {
      slots.push(date)
    }
  }

  return slots.slice(0, 3) // Return max 3 slots
}

// Validate Bangkok coordinates (rough bounds)
export function isInBangkok(lat: number, lng: number): boolean {
  // Bangkok rough bounds
  const minLat = 13.4
  const maxLat = 14.2
  const minLng = 100.3
  const maxLng = 100.9

  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

// Calculate distance between two points in km (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Check if delivery distance is within 30km limit
export function isWithinDeliveryRadius(
  sellerLat: number,
  sellerLng: number,
  buyerLat: number,
  buyerLng: number
): boolean {
  const distance = calculateDistance(sellerLat, sellerLng, buyerLat, buyerLng)
  return distance <= 30
}

// Slugify shop name for URL
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Classname utility (like clsx/cn)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
