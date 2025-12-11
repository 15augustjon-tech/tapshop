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

  // Fetch seller by shop_slug (case-insensitive)
  const { data: seller, error: sellerError } = await supabase
    .from('sellers')
    .select('id, shop_name, shop_slug, shop_bio, is_active, onboarding_completed')
    .ilike('shop_slug', shopSlug)
    .single()

  if (sellerError || !seller) {
    console.log('Shop not found:', shopSlug, sellerError)
    return null
  }

  // Shop must be active and onboarding complete
  if (seller.is_active === false || !seller.onboarding_completed) {
    console.log('Shop not active or onboarding incomplete:', seller.shop_slug)
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
      shop_slug: seller.shop_slug,
      shop_bio: seller.shop_bio
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
      shopBio={data.seller.shop_bio}
      products={data.products}
    />
  )
}
