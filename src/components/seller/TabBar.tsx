'use client'

interface TabBarProps {
  activeTab: 'orders' | 'products'
  onTabChange: (tab: 'orders' | 'products') => void
  orderCount?: number
  productCount?: number
}

export default function TabBar({ activeTab, onTabChange, orderCount, productCount }: TabBarProps) {
  return (
    <div className="glass-card !rounded-[16px] p-1.5 mb-4">
      <div className="flex">
        <button
          onClick={() => onTabChange('orders')}
          className={`flex-1 py-3 text-center font-medium transition-all rounded-[12px] ${
            activeTab === 'orders'
              ? 'bg-[#1a1a1a] text-white shadow-md'
              : 'text-[#7a6f63] hover:text-[#1a1a1a]'
          }`}
        >
          ออเดอร์
          {orderCount !== undefined && orderCount > 0 && (
            <span className={`ml-1.5 text-sm ${activeTab === 'orders' ? 'text-white/70' : ''}`}>({orderCount})</span>
          )}
        </button>
        <button
          onClick={() => onTabChange('products')}
          className={`flex-1 py-3 text-center font-medium transition-all rounded-[12px] ${
            activeTab === 'products'
              ? 'bg-[#1a1a1a] text-white shadow-md'
              : 'text-[#7a6f63] hover:text-[#1a1a1a]'
          }`}
        >
          สินค้า
          {productCount !== undefined && (
            <span className={`ml-1.5 text-sm ${activeTab === 'products' ? 'text-white/70' : ''}`}>({productCount})</span>
          )}
        </button>
      </div>
    </div>
  )
}
