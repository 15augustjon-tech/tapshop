'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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

  // Don't render cart-dependent UI until localStorage is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <ShopHeader
        shopName={shopName}
        cartCount={itemCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Product Grid */}
      <ProductGrid
        products={products}
        onProductClick={handleProductClick}
      />

      {/* Sticky Cart Bar */}
      <StickyCartBar
        itemCount={itemCount}
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
