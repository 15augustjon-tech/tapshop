'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShopHeader,
  ProductGrid,
  ProductModal,
  CartDrawer,
  StickyCartBar,
  Toast
} from '@/components/shop'
import type { Product } from '@/components/shop'
import { useCart } from '@/hooks/useCart'

interface ShopClientProps {
  shopName: string
  shopSlug: string
  products: Product[]
}

export default function ShopClient({ shopName, shopSlug, products }: ShopClientProps) {
  const router = useRouter()
  const {
    items,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    getItemCount,
    getSubtotal
  } = useCart(shopSlug)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isToastVisible, setIsToastVisible] = useState(false)

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setIsToastVisible(true)
  }, [])

  const handleProductClick = useCallback((product: Product) => {
    if (product.stock > 0) {
      setSelectedProduct(product)
      setIsModalOpen(true)
    }
  }, [])

  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      stock: product.stock
    }, quantity)
    showToast('เพิ่มลงตะกร้าแล้ว')
  }, [addItem, showToast])

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false)
    router.push(`/${shopSlug}/checkout`)
  }, [router, shopSlug])

  const itemCount = getItemCount()
  const subtotal = getSubtotal()

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-dvh relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="ambient-light ambient-1" />
        <div className="ambient-light ambient-2" />

        <ShopHeader
          shopName={shopName}
          cartCount={0}
          onCartClick={() => {}}
        />
        <ProductGrid
          products={products}
          onProductClick={() => {}}
        />
      </div>
    )
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      {/* Ambient Light Decorations */}
      <div className="ambient-light ambient-1" />
      <div className="ambient-light ambient-2" />
      <div className="ambient-light ambient-3" />

      {/* Glass Orbs */}
      <div className="glass-orb w-[100px] h-[100px] top-[10%] right-[5%] animate-orb" />
      <div className="glass-orb w-[60px] h-[60px] bottom-[30%] left-[5%] animate-orb" style={{ animationDelay: '3s' }} />

      {/* Floating Sparkles */}
      <div className="floating-element float-sparkle top-[20%] left-[10%] animate-twinkle" />
      <div className="floating-element float-sparkle top-[40%] right-[12%] animate-twinkle" style={{ animationDelay: '1s' }} />
      <div className="floating-element float-sparkle bottom-[35%] left-[15%] animate-twinkle" style={{ animationDelay: '0.5s' }} />

      {/* Header */}
      <ShopHeader
        shopName={shopName}
        cartCount={itemCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Delivery Banner */}
      <div className="px-4 pt-4">
        <div className="glass-card p-4 animate-card animate-card-1">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="icon-box green flex-shrink-0 animate-bounce-gentle">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1a1a1a]">
                ส่งถึงบ้านวันนี้ เริ่ม <span className="text-[#22c55e] font-bold">฿39</span>
              </p>
              <p className="text-[12px] text-[#7a6f63]">กรุงเทพและปริมณฑล • 45-60 นาที</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        onProductClick={handleProductClick}
      />

      {/* Powered by TapShop */}
      <div className="text-center py-8 text-xs text-[rgba(166,154,140,0.7)]">
        ขับเคลื่อนโดย{' '}
        <Link href="/" className="text-[#7a6f63] font-semibold hover:text-[#1a1a1a] transition-colors">
          TapShop
        </Link>
      </div>

      {/* Sticky Cart Bar */}
      <StickyCartBar
        itemCount={itemCount}
        subtotal={subtotal}
        onClick={() => setIsCartOpen(true)}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        subtotal={subtotal}
        onCheckout={handleCheckout}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  )
}
