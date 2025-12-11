import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import ShopClient from './ShopClient'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ shopname: string }>
}

interface ShopData {
  seller: {
    shop_name: string
    shop_slug: string
    shop_bio?: string
  }
  products: Array<{
    id: string
    name: string
    price: number
    stock: number
    image_url: string | null
    is_active: boolean
  }>
}

async function getShopData(shopSlug: string): Promise<ShopData | null> {
  try {
    // Get the host from headers to build absolute URL
    const headersList = await headers()
    const host = headersList.get('host') || 'tapshop.me'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    const res = await fetch(`${baseUrl}/api/shops/${shopSlug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()

    if (!data.success) {
      return null
    }

    return {
      seller: data.seller,
      products: data.products || []
    }
  } catch (error) {
    console.error('Failed to fetch shop data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { shopname } = await params
  const data = await getShopData(shopname)

  if (!data) {
    return {
      title: 'ไม่พบร้านค้า | TapShop'
    }
  }

  return {
    title: `${data.seller.shop_name} | TapShop`,
    description: `ซื้อสินค้าจากร้าน ${data.seller.shop_name} ผ่าน TapShop`
  }
}

export default async function ShopPage({ params }: Props) {
  const { shopname } = await params
  const data = await getShopData(shopname)

  if (!data) {
    notFound()
  }

  return (
    <ShopClient
      shopName={data.seller.shop_name}
      shopSlug={data.seller.shop_slug}
      shopBio={data.seller.shop_bio || ''}
      products={data.products}
    />
  )
}
