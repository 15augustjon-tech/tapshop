// Delivery scheduling and quote utilities

interface SellerSchedule {
  shipping_days: string[] // e.g., ['mon', 'tue', 'wed', 'thu', 'fri']
  shipping_time: string   // e.g., '14:00'
}

interface DeliverySlot {
  date: Date
  dateString: string      // e.g., 'วันจันทร์ที่ 15 ม.ค.'
  timeString: string      // e.g., '14:00'
  fullString: string      // e.g., 'วันจันทร์ที่ 15 ม.ค. 14:00'
}

const DAY_NAMES_TH: Record<string, string> = {
  sun: 'อาทิตย์',
  mon: 'จันทร์',
  tue: 'อังคาร',
  wed: 'พุธ',
  thu: 'พฤหัสบดี',
  fri: 'ศุกร์',
  sat: 'เสาร์'
}

const DAY_MAP: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat'
}

const MONTH_NAMES_TH = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
]

// Minimum hours before shipping time to qualify for same-day delivery
const MIN_HOURS_BEFORE_SHIPPING = 3

/**
 * Get the next available delivery slot based on seller's schedule
 */
export function getNextDeliverySlot(
  seller: SellerSchedule,
  orderTime: Date = new Date()
): DeliverySlot {
  const shippingDays = seller.shipping_days || ['mon', 'tue', 'wed', 'thu', 'fri']
  const [shippingHour, shippingMinute] = (seller.shipping_time || '14:00').split(':').map(Number)

  // Start checking from today
  const checkDate = new Date(orderTime)

  // Check up to 14 days ahead
  for (let i = 0; i < 14; i++) {
    const dayKey = DAY_MAP[checkDate.getDay()]

    if (shippingDays.includes(dayKey)) {
      // Create shipping time for this day
      const shippingDateTime = new Date(checkDate)
      shippingDateTime.setHours(shippingHour, shippingMinute, 0, 0)

      // Calculate cutoff time (3 hours before shipping)
      const cutoffTime = new Date(shippingDateTime)
      cutoffTime.setHours(cutoffTime.getHours() - MIN_HOURS_BEFORE_SHIPPING)

      // If today and order is before cutoff, deliver today
      if (i === 0 && orderTime < cutoffTime) {
        return formatDeliverySlot(shippingDateTime)
      }

      // If future day, use this slot
      if (i > 0) {
        return formatDeliverySlot(shippingDateTime)
      }
    }

    // Move to next day
    checkDate.setDate(checkDate.getDate() + 1)
  }

  // Fallback: next week same day (shouldn't happen with valid schedule)
  const fallbackDate = new Date(orderTime)
  fallbackDate.setDate(fallbackDate.getDate() + 7)
  fallbackDate.setHours(shippingHour, shippingMinute, 0, 0)
  return formatDeliverySlot(fallbackDate)
}

function formatDeliverySlot(date: Date): DeliverySlot {
  const dayKey = DAY_MAP[date.getDay()]
  const dayName = DAY_NAMES_TH[dayKey]
  const day = date.getDate()
  const month = MONTH_NAMES_TH[date.getMonth()]
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

  const dateString = `วัน${dayName}ที่ ${day} ${month}`
  const timeString = time
  const fullString = `${dateString} ${timeString}`

  return {
    date,
    dateString,
    timeString,
    fullString
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
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
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Estimate delivery fee based on distance
 * MVP: Simple distance-based pricing until Lalamove integration
 */
export function estimateDeliveryFee(distanceKm: number): number {
  // Base fee + per km rate
  const baseFee = 40
  const perKmRate = 8

  // Calculate fee
  const fee = baseFee + Math.ceil(distanceKm) * perKmRate

  // Cap at reasonable amount
  return Math.min(fee, 300)
}

// COD fee is fixed
export const COD_FEE = 40

// Maximum delivery distance in km
export const MAX_DELIVERY_DISTANCE = 30
