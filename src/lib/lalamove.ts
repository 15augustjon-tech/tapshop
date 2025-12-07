// Lalamove API wrapper with retry logic and COD support
// Docs: https://developers.lalamove.com/

import crypto from 'crypto'

const API_KEY = process.env.LALAMOVE_API_KEY || ''
const API_SECRET = process.env.LALAMOVE_API_SECRET || ''
const BASE_URL = process.env.LALAMOVE_BASE_URL || 'https://rest.sandbox.lalamove.com'

// Service types
export type ServiceType = 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK'

// Response types
export interface LalamoveQuote {
  quotationId: string
  fee: number
  currency: string
  expiresAt: string
}

export interface LalamoveOrder {
  orderId: string
  shareLink: string
  status: string
}

export interface LalamoveDriver {
  name: string
  phone: string
  plateNumber: string
}

export interface LalamoveOrderStatus {
  status: string
  driver?: LalamoveDriver
}

// Error class
export class LalamoveError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'LalamoveError'
  }
}

/**
 * Generate HMAC signature for Lalamove API authentication
 */
function generateSignature(
  method: string,
  path: string,
  timestamp: string,
  body: string
): string {
  const message = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(message)
    .digest('hex')
}

/**
 * Make authenticated request to Lalamove API with retry logic
 */
async function lalamoveRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: object,
  retries: number = 3
): Promise<T> {
  const timestamp = Date.now().toString()
  const bodyString = body ? JSON.stringify(body) : ''
  const signature = generateSignature(method, path, timestamp, bodyString)

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `hmac ${API_KEY}:${timestamp}:${signature}`,
          'Market': 'TH',
          'Request-ID': `${timestamp}-${Math.random().toString(36).substr(2, 9)}`
        },
        ...(bodyString && { body: bodyString })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new LalamoveError(
          errorData.message || `Lalamove API error: ${response.status}`,
          response.status,
          errorData.code
        )
      }

      return await response.json() as T
    } catch (error) {
      lastError = error as Error
      console.error(`Lalamove API attempt ${attempt} failed:`, error)

      // Don't retry on client errors (4xx)
      if (error instanceof LalamoveError && error.statusCode && error.statusCode < 500) {
        throw error
      }

      // Exponential backoff for retries
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new LalamoveError('Unknown error after retries')
}

/**
 * Get delivery quote from Lalamove
 */
export async function getQuote(
  pickupLat: number,
  pickupLng: number,
  pickupAddress: string,
  dropoffLat: number,
  dropoffLng: number,
  dropoffAddress: string,
  serviceType: ServiceType = 'MOTORCYCLE'
): Promise<LalamoveQuote> {
  const body = {
    data: {
      serviceType,
      language: 'th_TH',
      stops: [
        {
          coordinates: {
            lat: pickupLat.toString(),
            lng: pickupLng.toString()
          },
          address: pickupAddress
        },
        {
          coordinates: {
            lat: dropoffLat.toString(),
            lng: dropoffLng.toString()
          },
          address: dropoffAddress
        }
      ],
      isRouteOptimized: false
    }
  }

  interface QuoteResponse {
    data: {
      quotationId: string
      priceBreakdown: {
        total: string
        currency: string
      }
      expiresAt: string
    }
  }

  const result = await lalamoveRequest<QuoteResponse>('POST', '/v3/quotations', body)

  return {
    quotationId: result.data.quotationId,
    fee: Math.ceil(parseFloat(result.data.priceBreakdown.total)),
    currency: result.data.priceBreakdown.currency,
    expiresAt: result.data.expiresAt
  }
}

/**
 * Create a delivery order on Lalamove
 */
export async function createOrder(
  quotationId: string,
  senderName: string,
  senderPhone: string,
  recipientName: string,
  recipientPhone: string,
  codAmount?: number,
  remarks?: string
): Promise<LalamoveOrder> {
  const body = {
    data: {
      quotationId,
      sender: {
        stopId: 0,
        name: senderName,
        phone: formatPhoneForLalamove(senderPhone)
      },
      recipients: [
        {
          stopId: 1,
          name: recipientName,
          phone: formatPhoneForLalamove(recipientPhone),
          remarks: remarks || ''
        }
      ],
      isRecipientRequired: true,
      isPODRequired: true,
      paymentMethod: 'WALLET',
      ...(codAmount && codAmount > 0 && {
        metadata: {
          codAmount: codAmount.toString()
        }
      })
    }
  }

  interface OrderResponse {
    data: {
      orderId: string
      shareLink: string
      status: string
    }
  }

  const result = await lalamoveRequest<OrderResponse>('POST', '/v3/orders', body)

  return {
    orderId: result.data.orderId,
    shareLink: result.data.shareLink,
    status: result.data.status
  }
}

/**
 * Get order status and driver info from Lalamove
 */
export async function getOrderStatus(orderId: string): Promise<LalamoveOrderStatus> {
  interface StatusResponse {
    data: {
      status: string
      driver?: {
        name: string
        phone: string
        plateNumber: string
      }
    }
  }

  const result = await lalamoveRequest<StatusResponse>('GET', `/v3/orders/${orderId}`)

  return {
    status: result.data.status,
    driver: result.data.driver ? {
      name: result.data.driver.name,
      phone: result.data.driver.phone,
      plateNumber: result.data.driver.plateNumber
    } : undefined
  }
}

/**
 * Cancel a Lalamove order
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
  try {
    await lalamoveRequest('PUT', `/v3/orders/${orderId}/cancel`)
    return true
  } catch (error) {
    console.error('Cancel Lalamove order error:', error)
    return false
  }
}

/**
 * Format Thai phone number for Lalamove API (+66 format)
 */
function formatPhoneForLalamove(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  // If starts with 0, replace with +66
  if (digits.startsWith('0')) {
    return `+66${digits.slice(1)}`
  }

  // If already has country code
  if (digits.startsWith('66')) {
    return `+${digits}`
  }

  // Fallback: assume Thai number
  return `+66${digits}`
}

/**
 * Check if Lalamove is configured
 */
export function isLalamoveConfigured(): boolean {
  return !!(API_KEY && API_SECRET)
}

/**
 * Lalamove status mapping to our delivery status
 */
export const LALAMOVE_STATUS_MAP: Record<string, string> = {
  'ASSIGNING_DRIVER': 'booked',
  'ON_GOING': 'assigned',
  'PICKED_UP': 'picked_up',
  'COMPLETED': 'delivered',
  'CANCELED': 'cancelled',
  'REJECTED': 'failed',
  'EXPIRED': 'expired'
}

/**
 * Map Lalamove status to order status
 */
export const LALAMOVE_TO_ORDER_STATUS: Record<string, string> = {
  'ON_GOING': 'dispatched',
  'PICKED_UP': 'picked_up',
  'COMPLETED': 'delivered',
  'CANCELED': 'cancelled',
  'REJECTED': 'failed'
}

// Legacy exports for backward compatibility
export const getDeliveryQuote = async (request: {
  pickupLocation: { lat: string; lng: string; address: string }
  dropoffLocation: { lat: string; lng: string; address: string }
}) => {
  const quote = await getQuote(
    parseFloat(request.pickupLocation.lat),
    parseFloat(request.pickupLocation.lng),
    request.pickupLocation.address,
    parseFloat(request.dropoffLocation.lat),
    parseFloat(request.dropoffLocation.lng),
    request.dropoffLocation.address
  )
  return {
    quotationId: quote.quotationId,
    priceBreakdown: {
      total: quote.fee.toString(),
      currency: quote.currency
    }
  }
}

export const createDeliveryOrder = async (request: {
  quotationId: string
  pickupName: string
  pickupPhone: string
  dropoffName: string
  dropoffPhone: string
  remarks?: string
}) => {
  return createOrder(
    request.quotationId,
    request.pickupName,
    request.pickupPhone,
    request.dropoffName,
    request.dropoffPhone,
    undefined,
    request.remarks
  )
}
