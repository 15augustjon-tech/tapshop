'use client'

interface FilterPillsProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const FILTERS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'shipping', label: 'กำลังส่ง' },
  { value: 'delivered', label: 'ส่งแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' }
]

export default function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4 scrollbar-hide">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeFilter === filter.value
              ? 'bg-[#1a1a1a] text-white shadow-lg'
              : 'glass-card-inner hover:bg-white/60 text-[#1a1a1a]'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
