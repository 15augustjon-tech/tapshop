'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between text-sm text-[#7a6f63] mb-2">
        <span>ขั้นตอนที่ {currentStep} จาก {totalSteps}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden border border-[#e8e2da]">
        <div
          className="h-full bg-[#1a1a1a] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
