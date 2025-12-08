'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  ordersToday: number
  revenueToday: number
  pendingOrders: number
  failedDeliveries: number
  totalOrdersAllTime: number
  totalRevenueAllTime: number
  ourCut: number
}

interface Order {
  id: string
  order_number: string
  shop_name: string
  buyer_name: string
  total: number
  status: string
  created_at: string
}

interface Seller {
  id: string
  shop_name: string
  phone: string
  total_orders: number
  total_revenue: number
  is_active: boolean
  created_at: string
}

const TAB_LABELS: Record<string, string> = {
  orders: 'ออเดอร์',
  sellers: 'ผู้ขาย',
  revenue: 'รายได้'
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  dispatched: 'กำลังส่ง',
  delivered: 'ส่งแล้ว',
  cancelled: 'ยกเลิก',
  failed: 'ล้มเหลว'
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'orders' | 'sellers' | 'revenue'>('orders')
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  // Check authentication
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then(res => {
        if (!res.ok) {
          router.push('/admin/login')
        } else {
          setAuthChecked(true)
        }
      })
      .catch(() => {
        router.push('/admin/login')
      })
  }, [router])

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // Load stats
  useEffect(() => {
    if (!authChecked) return
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats)
      })
      .catch(() => {})
  }, [authChecked])

  // Load data based on active tab
  useEffect(() => {
    if (!authChecked) return
    setLoading(true)
    if (activeTab === 'orders') {
      const url = statusFilter
        ? `/api/admin/orders?status=${statusFilter}`
        : '/api/admin/orders'
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.success) setOrders(data.orders)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else if (activeTab === 'sellers') {
      fetch('/api/admin/sellers')
        .then(res => res.json())
        .then(data => {
          if (data.success) setSellers(data.sellers)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [activeTab, statusFilter, authChecked])

  const handleCancelOrder = async (orderId: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}/cancel`, { method: 'POST' })
    if (res.ok) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    }
    setShowCancelModal(null)
  }

  const handleToggleSeller = async (sellerId: string, currentStatus: boolean) => {
    const res = await fetch(`/api/admin/sellers/${sellerId}/toggle`, { method: 'POST' })
    if (res.ok) {
      setSellers(sellers.map(s => s.id === sellerId ? { ...s, is_active: !currentStatus } : s))
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">TapShop Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">ยกเลิกออเดอร์</h3>
            <p className="text-gray-600 mb-4">คุณต้องการยกเลิกออเดอร์นี้หรือไม่?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                ไม่ใช่
              </button>
              <button
                onClick={() => handleCancelOrder(showCancelModal)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">ออเดอร์วันนี้</div>
            <div className="text-2xl font-bold">{stats.ordersToday}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">รายได้วันนี้</div>
            <div className="text-2xl font-bold text-green-600">฿{stats.revenueToday.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">รอยืนยัน</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">ส่งไม่สำเร็จ</div>
            <div className="text-2xl font-bold text-red-600">{stats.failedDeliveries}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            {(['orders', 'sellers', 'revenue'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              {/* Filters */}
              <div className="mb-4 flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">ทุกสถานะ</option>
                  <option value="pending">รอยืนยัน</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="dispatched">กำลังส่ง</option>
                  <option value="delivered">ส่งแล้ว</option>
                  <option value="cancelled">ยกเลิก</option>
                  <option value="failed">ล้มเหลว</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">ไม่พบออเดอร์</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">ออเดอร์</th>
                        <th className="px-4 py-2 text-left">ร้านค้า</th>
                        <th className="px-4 py-2 text-left">ลูกค้า</th>
                        <th className="px-4 py-2 text-right">ยอด</th>
                        <th className="px-4 py-2 text-center">สถานะ</th>
                        <th className="px-4 py-2 text-left">วันที่</th>
                        <th className="px-4 py-2 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 font-mono">{order.order_number}</td>
                          <td className="px-4 py-3">{order.shop_name}</td>
                          <td className="px-4 py-3">{order.buyer_name}</td>
                          <td className="px-4 py-3 text-right">฿{order.total.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(order.status)}`}>
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => setShowCancelModal(order.id)}
                                className="text-red-600 hover:underline text-xs"
                              >
                                ยกเลิก
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sellers Tab */}
          {activeTab === 'sellers' && (
            <div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
              ) : sellers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">ไม่พบผู้ขาย</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">ชื่อร้าน</th>
                        <th className="px-4 py-2 text-left">เบอร์โทร</th>
                        <th className="px-4 py-2 text-right">ออเดอร์</th>
                        <th className="px-4 py-2 text-right">รายได้</th>
                        <th className="px-4 py-2 text-center">สถานะ</th>
                        <th className="px-4 py-2 text-left">สมัครเมื่อ</th>
                        <th className="px-4 py-2 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sellers.map(seller => (
                        <tr key={seller.id}>
                          <td className="px-4 py-3 font-medium">{seller.shop_name}</td>
                          <td className="px-4 py-3">{seller.phone}</td>
                          <td className="px-4 py-3 text-right">{seller.total_orders}</td>
                          <td className="px-4 py-3 text-right">฿{seller.total_revenue.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              seller.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {seller.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(seller.created_at).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleSeller(seller.id, seller.is_active)}
                              className={`text-xs hover:underline ${
                                seller.is_active ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {seller.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && stats && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">รายได้รวมทั้งหมด</div>
                  <div className="text-xl font-bold">฿{stats.totalRevenueAllTime.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">ออเดอร์ทั้งหมด</div>
                  <div className="text-xl font-bold">{stats.totalOrdersAllTime}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">ค่าบริการ (฿40 x ออเดอร์)</div>
                  <div className="text-xl font-bold text-green-600">฿{stats.ourCut.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-500">ค่าธรรมเนียม COD</div>
                  <div className="text-xl font-bold">฿{(stats.totalOrdersAllTime * 10).toLocaleString()}</div>
                </div>
              </div>

              <div className="text-gray-500 text-sm">
                ระบบติดตามการจ่ายเงินจะเปิดให้บริการเร็วๆ นี้...
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  )
}
