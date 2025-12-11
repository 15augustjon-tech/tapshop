'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardHeader from '@/components/seller/DashboardHeader'
import ShopQRCode from '@/components/seller/ShopQRCode'
import StatsCard from '@/components/seller/StatsCard'
import TabBar from '@/components/seller/TabBar'
import FilterPills from '@/components/seller/FilterPills'
import OrderCard from '@/components/seller/OrderCard'
import ProductCard from '@/components/seller/ProductCard'
import EmptyState from '@/components/seller/EmptyState'
import ConfirmationBanner from '@/components/seller/ConfirmationBanner'

interface Seller {
  id: string
  shop_name: string
  shop_slug: string
}

interface Stats {
  total_earnings: number
  total_orders: number
  pending_orders: number
  total_products: number
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  customer_address: string
  delivery_notes?: string
  subtotal: number
  total: number
  scheduled_date?: string
  scheduled_time?: string
  created_at: string
  order_items: Array<{
    id: string
    product_name: string
    quantity: number
    product_price: number
  }>
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image_url?: string
  is_active: boolean
}

export default function SellerDashboard() {
  const router = useRouter()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders')
  const [orderFilter, setOrderFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [confirmingAll, setConfirmingAll] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)

  // Fetch seller data
  const fetchSeller = useCallback(async () => {
    try {
      const res = await fetch('/api/sellers/me')
      const data = await res.json()

      if (!data.success) {
        if (data.error === 'unauthorized') {
          router.push('/seller/signup')
          return
        }
        throw new Error(data.message)
      }

      setSeller(data.seller)

      // If onboarding not completed, redirect
      if (!data.seller.onboarding_completed) {
        router.push('/seller/signup/info')
        return
      }
    } catch (error) {
      console.error('Failed to fetch seller:', error)
    }
  }, [router])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/sellers/me/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const statusParam = orderFilter !== 'all' ? `&status=${orderFilter}` : ''
      const res = await fetch(`/api/sellers/me/orders?page=1&limit=50${statusParam}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }, [orderFilter])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/sellers/me/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchSeller()
      await Promise.all([fetchStats(), fetchOrders(), fetchProducts()])
      setLoading(false)
    }
    loadData()
  }, [fetchSeller, fetchStats, fetchOrders, fetchProducts])

  // Refetch orders when filter changes
  useEffect(() => {
    if (!loading) {
      fetchOrders()
    }
  }, [orderFilter, fetchOrders, loading])

  // Pull to refresh (for future use)
  const _handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchStats(), fetchOrders(), fetchProducts()])
    setRefreshing(false)
  }
  void _handleRefresh // suppress unused warning

  // Confirm all pending orders
  const handleConfirmAll = async () => {
    if (!confirm(`ยืนยันส่งของวันนี้ ${stats?.pending_orders || 0} รายการ?`)) return

    setConfirmingAll(true)
    try {
      const res = await fetch('/api/sellers/me/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_all' })
      })
      const data = await res.json()

      if (data.success) {
        await Promise.all([fetchStats(), fetchOrders()])
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to confirm orders:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setConfirmingAll(false)
    }
  }

  // Update single order status
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/sellers/me/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()

      if (!data.success) {
        alert(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      await Promise.all([fetchOrders(), fetchStats()])
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  // Copy shop link
  const handleCopyLink = async () => {
    if (!seller?.shop_slug) return
    try {
      await navigator.clipboard.writeText(`https://tapshop.me/${seller.shop_slug}`)
      alert('คัดลอกลิงก์แล้ว!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="icon-box w-16 h-16 !rounded-[20px] animate-pulse">
          <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main overflow-x-hidden">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      <div className="px-4 pb-24 pt-[env(safe-area-inset-top)] relative z-10">
        {/* Header with Preview and QR Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            <DashboardHeader shopName={seller?.shop_name || ''} />
          </div>
          <div className="flex items-center gap-1">
            {/* Preview Shop Button */}
            <a
              href={`/${seller?.shop_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform"
              title="ดูหน้าร้าน"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </a>
            {/* QR Code Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform"
              title="แชร์ร้านของคุณ"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
            {/* Settings Button */}
            <Link
              href="/seller/settings"
              className="w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform"
              title="ตั้งค่า"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 mt-2">
          <StatsCard
            totalEarnings={stats?.total_earnings || 0}
            shopSlug={seller?.shop_slug || ''}
            todayOrders={stats?.total_orders || 0}
            totalViews={0}
          />
        </div>

        {/* Quick Actions - matches prototype design */}
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          <Link
            href="/seller/products"
            className="flex flex-col items-center gap-1.5 py-4 px-2 glass-card !rounded-[16px] hover:-translate-y-1 transition-transform"
          >
            <span className="text-2xl">📦</span>
            <span className="text-[11px] font-semibold text-[#7a6f63]">สินค้า</span>
          </Link>
          <Link
            href="/seller/products/new"
            className="flex flex-col items-center gap-1.5 py-4 px-2 glass-card !rounded-[16px] hover:-translate-y-1 transition-transform"
          >
            <span className="text-2xl">➕</span>
            <span className="text-[11px] font-semibold text-[#7a6f63]">เพิ่มใหม่</span>
          </Link>
          <a
            href={`/${seller?.shop_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 py-4 px-2 glass-card !rounded-[16px] hover:-translate-y-1 transition-transform"
          >
            <span className="text-2xl">👁️</span>
            <span className="text-[11px] font-semibold text-[#7a6f63]">ดูร้าน</span>
          </a>
          <button
            onClick={() => setShowQRModal(true)}
            className="flex flex-col items-center gap-1.5 py-4 px-2 glass-card !rounded-[16px] hover:-translate-y-1 transition-transform"
          >
            <span className="text-2xl">📱</span>
            <span className="text-[11px] font-semibold text-[#7a6f63]">QR Code</span>
          </button>
        </div>

        {/* Confirmation Banner */}
        {stats && stats.pending_orders > 0 && (
          <div className="mb-4">
            <ConfirmationBanner
              pendingCount={stats.pending_orders}
              onConfirmAll={handleConfirmAll}
              loading={confirmingAll}
            />
          </div>
        )}

        {/* Pull to refresh indicator */}
        {refreshing && (
          <div className="text-center py-2">
            <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Tab Bar */}
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          orderCount={stats?.total_orders}
          productCount={stats?.total_products}
        />

        {/* Content */}
        {activeTab === 'orders' ? (
          <div>
            {/* Filter Pills */}
            <FilterPills
              activeFilter={orderFilter}
              onFilterChange={setOrderFilter}
            />

            {/* Orders List */}
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleOrderStatusChange}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="orders"
                title="ยังไม่มีออเดอร์"
                description="แชร์ลิงก์ร้านให้ลูกค้าเพื่อเริ่มขาย"
                actionLabel="คัดลอกลิงก์ร้าน"
                onAction={handleCopyLink}
              />
            )}
          </div>
        ) : (
          <div className="pt-4">
            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="products"
                title="ยังไม่มีสินค้า"
                description="เพิ่มสินค้าเพื่อเริ่มขาย"
                actionLabel="เพิ่มสินค้าชิ้นแรก"
                onAction={() => router.push('/seller/products/new')}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link
        href="/seller/products/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1a1a1a] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {/* QR Code Modal */}
      {showQRModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="glass-card !rounded-[24px] p-6 w-full max-w-sm relative animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold text-[#1a1a1a] text-center mb-6">แชร์ร้านของคุณ</h2>

            {/* QR Code Component */}
            {seller?.shop_slug && (
              <ShopQRCode
                shopSlug={seller.shop_slug}
                size={200}
                instruction="ลูกค้าสแกน QR เพื่อเข้าร้าน"
              />
            )}

            {/* Close Button at Bottom */}
            <button
              onClick={() => setShowQRModal(false)}
              className="btn-secondary w-full mt-6"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
