'use client'

interface TabBarProps {
  activeTab: 'orders' | 'products'
  onTabChange: (tab: 'orders' | 'products') => void
  orderCount?: number
  productCount?: number
}

export default function TabBar({ activeTab, onTabChange, orderCount, productCount }: TabBarProps) {
  return (
    <div className="flex border-b border-border">
      <button
        onClick={() => onTabChange('orders')}
        className={`flex-1 py-4 text-center font-medium transition-colors relative ${
          activeTab === 'orders'
            ? 'text-black'
            : 'text-secondary hover:text-black'
        }`}
      >
        ออเดอร์
        {orderCount !== undefined && orderCount > 0 && (
          <span className="ml-1 text-sm">({orderCount})</span>
        )}
        {activeTab === 'orders' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
        )}
      </button>
      <button
        onClick={() => onTabChange('products')}
        className={`flex-1 py-4 text-center font-medium transition-colors relative ${
          activeTab === 'products'
            ? 'text-black'
            : 'text-secondary hover:text-black'
        }`}
      >
        สินค้า
        {productCount !== undefined && (
          <span className="ml-1 text-sm">({productCount})</span>
        )}
        {activeTab === 'products' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
        )}
      </button>
    </div>
  )
}
