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
    <div className="flex gap-2 overflow-x-auto py-4 -mx-[5%] px-[5%] scrollbar-hide">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilter === filter.value
              ? 'bg-black text-white'
              : 'border border-border text-black hover:bg-neutral-50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
