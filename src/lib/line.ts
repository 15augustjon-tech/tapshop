// LINE Messaging API Integration
// Send notifications to sellers via LINE

const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''

export function isLineConfigured(): boolean {
  return !!LINE_ACCESS_TOKEN
}

// Send simple text message
export async function sendLineMessage(
  userId: string,
  message: string
): Promise<void> {
  if (!isLineConfigured()) {
    console.log('[LINE] Not configured, skipping message:', message.substring(0, 50))
    return
  }

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: 'text', text: message }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[LINE] API error:', error)
    throw new Error(`LINE API error: ${response.status}`)
  }
}

// Send Flex message (rich card)
export async function sendLineFlexMessage(
  userId: string,
  altText: string,
  contents: object
): Promise<void> {
  if (!isLineConfigured()) {
    console.log('[LINE] Not configured, skipping flex message:', altText)
    return
  }

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [{
        type: 'flex',
        altText,
        contents
      }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[LINE] API error:', error)
    throw new Error(`LINE API error: ${response.status}`)
  }
}

// =============================================================================
// NOTIFICATION TEMPLATES
// =============================================================================

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface NewOrderData {
  orderNumber: string
  items: OrderItem[]
  total: number
  buyerName: string
  deliveryTime: string
}

// 1. NEW ORDER - Sent when buyer places order
export async function sendNewOrderNotification(
  lineUserId: string,
  data: NewOrderData
): Promise<void> {
  const itemsText = data.items
    .map(item => `${item.name} x ${item.quantity}`)
    .join('\n')

  const contents = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '🛒 ออเดอร์ใหม่!',
          weight: 'bold',
          size: 'lg'
        },
        {
          type: 'separator',
          margin: 'md'
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: `#${data.orderNumber}`,
              size: 'sm',
              color: '#888888'
            },
            {
              type: 'text',
              text: itemsText,
              margin: 'sm',
              wrap: true
            },
            {
              type: 'text',
              text: `฿${data.total.toLocaleString()}`,
              weight: 'bold',
              margin: 'sm'
            }
          ]
        },
        {
          type: 'separator',
          margin: 'md'
        },
        {
          type: 'text',
          text: `ลูกค้า: ${data.buyerName}`,
          margin: 'md',
          size: 'sm'
        },
        {
          type: 'text',
          text: `จัดส่ง: ${data.deliveryTime}`,
          size: 'sm',
          color: '#FF6B00'
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: 'ดูรายละเอียด',
            uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tapshop.me'}/seller/orders`
          },
          style: 'primary'
        }
      ]
    }
  }

  await sendLineFlexMessage(lineUserId, `ออเดอร์ใหม่ #${data.orderNumber}`, contents)
}

// 2. CONFIRMATION REMINDER - Sent 1 hour before shipping time
export async function sendConfirmationReminder(
  lineUserId: string,
  data: {
    pendingCount: number
    totalValue: number
  }
): Promise<void> {
  const contents = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '⏰ ถึงเวลายืนยันออเดอร์',
          weight: 'bold',
          size: 'lg'
        },
        {
          type: 'separator',
          margin: 'md'
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: `รอยืนยัน: ${data.pendingCount} รายการ`,
              size: 'md'
            },
            {
              type: 'text',
              text: `มูลค่ารวม: ฿${data.totalValue.toLocaleString()}`,
              weight: 'bold',
              margin: 'sm',
              color: '#FF6B00'
            }
          ]
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: 'ยืนยันออเดอร์',
            uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tapshop.me'}/seller/orders`
          },
          style: 'primary'
        }
      ]
    }
  }

  await sendLineFlexMessage(lineUserId, `มี ${data.pendingCount} ออเดอร์รอยืนยัน`, contents)
}

// 3. DRIVER ASSIGNED - Sent when Lalamove assigns driver
export async function sendDriverAssignedNotification(
  lineUserId: string,
  data: {
    orderNumber: string
    driverName: string
    driverPhone: string
    shareLink?: string
  }
): Promise<void> {
  const bodyContents = [
    {
      type: 'text',
      text: '🚗 ไรเดอร์รับงานแล้ว',
      weight: 'bold',
      size: 'lg'
    },
    {
      type: 'separator',
      margin: 'md'
    },
    {
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      contents: [
        {
          type: 'text',
          text: `#${data.orderNumber}`,
          size: 'sm',
          color: '#888888'
        },
        {
          type: 'text',
          text: `ไรเดอร์: ${data.driverName}`,
          margin: 'sm'
        },
        {
          type: 'text',
          text: `โทร: ${data.driverPhone}`,
          size: 'sm',
          color: '#666666'
        }
      ]
    }
  ]

  const contents: Record<string, unknown> = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: bodyContents
    }
  }

  if (data.shareLink) {
    contents.footer = {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: 'ติดตามการจัดส่ง',
            uri: data.shareLink
          },
          style: 'primary'
        }
      ]
    }
  }

  await sendLineFlexMessage(lineUserId, `ไรเดอร์รับงาน #${data.orderNumber}`, contents)
}

// 4. DELIVERY COMPLETED - Sent when delivery successful
export async function sendDeliveryCompletedNotification(
  lineUserId: string,
  data: {
    orderNumber: string
    earnings: number
  }
): Promise<void> {
  const contents = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '✅ ส่งสำเร็จ',
          weight: 'bold',
          size: 'lg',
          color: '#00B900'
        },
        {
          type: 'separator',
          margin: 'md'
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: `#${data.orderNumber}`,
              size: 'sm',
              color: '#888888'
            },
            {
              type: 'text',
              text: `คุณได้รับ: ฿${data.earnings.toLocaleString()}`,
              weight: 'bold',
              margin: 'md',
              size: 'lg',
              color: '#00B900'
            }
          ]
        }
      ]
    }
  }

  await sendLineFlexMessage(lineUserId, `ส่งสำเร็จ #${data.orderNumber}`, contents)
}

// 5. DELIVERY FAILED - Sent when delivery fails
export async function sendDeliveryFailedNotification(
  lineUserId: string,
  data: {
    orderNumber: string
    reason?: string
  }
): Promise<void> {
  const reasonContent = data.reason ? [{
    type: 'text' as const,
    text: `สาเหตุ: ${data.reason}`,
    margin: 'sm' as const,
    wrap: true,
    size: 'sm' as const
  }] : []

  const contents = {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '❌ ส่งไม่สำเร็จ',
          weight: 'bold',
          size: 'lg',
          color: '#FF0000'
        },
        {
          type: 'separator',
          margin: 'md'
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: `#${data.orderNumber}`,
              size: 'sm',
              color: '#888888'
            },
            ...reasonContent,
            {
              type: 'text',
              text: 'กรุณาติดต่อเรา',
              margin: 'md',
              size: 'sm',
              color: '#666666'
            }
          ]
        }
      ]
    }
  }

  await sendLineFlexMessage(lineUserId, `ส่งไม่สำเร็จ #${data.orderNumber}`, contents)
}
