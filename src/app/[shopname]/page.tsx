import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ShopClient from './ShopClient'

interface Props {
  params: Promise<{ shopname: string }>
}

async function getShopData(shopSlug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch seller by shop_slug
  const { data: seller, error: sellerError } = await supabase
    .from('sellers')
    .select('id, shop_name, shop_slug, is_active')
    .eq('shop_slug', shopSlug.toLowerCase())
    .single()

  if (sellerError || !seller || !seller.is_active) {
    return null
  }

  // Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, stock, image_url, is_active')
    .eq('seller_id', seller.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return {
    seller: {
      shop_name: seller.shop_name,
      shop_slug: seller.shop_slug
    },
    products: products || []
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
      products={data.products}
    />
  )
}
