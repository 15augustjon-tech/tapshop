'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, isVisible, onClose, duration = 2000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-toast">
      <div className="glass-card !rounded-full px-6 py-3 flex items-center gap-2 shadow-xl">
        <span className="w-5 h-5 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="font-semibold text-[#1a1a1a] relative z-10">{message}</span>
      </div>
    </div>
  )
}
