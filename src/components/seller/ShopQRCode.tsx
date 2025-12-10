'use client'

import { useState, useRef, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

interface ShopQRCodeProps {
  shopSlug: string
  size?: number
  showTitle?: boolean
  title?: string
  instruction?: string
}

export default function ShopQRCode({
  shopSlug,
  size = 200,
  showTitle = false,
  title = 'แชร์ร้านของคุณ',
  instruction = 'ลูกค้าสแกน QR เพื่อเข้าร้าน'
}: ShopQRCodeProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const shopUrl = `https://tapshop.me/${shopSlug}`
  const displayUrl = `tapshop.me/${shopSlug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shopUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = useCallback(async () => {
    if (!qrRef.current || downloading) return

    setDownloading(true)

    try {
      // Find the canvas element inside the ref
      const canvas = qrRef.current.querySelector('canvas')
      if (!canvas) {
        throw new Error('QR canvas not found')
      }

      // Create a high-resolution canvas for download
      const downloadCanvas = document.createElement('canvas')
      const downloadSize = 1000 // High resolution for download
      const padding = 80 // White padding around QR
      downloadCanvas.width = downloadSize + padding * 2
      downloadCanvas.height = downloadSize + padding * 2

      const ctx = downloadCanvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Fill white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height)

      // Draw QR code scaled up
      ctx.drawImage(canvas, padding, padding, downloadSize, downloadSize)

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        downloadCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/png', 1.0)
      })

      const filename = `tapshop-${shopSlug}-qr.png`

      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      if (isMobile && navigator.share && navigator.canShare) {
        // Try Web Share API for mobile (works well on iOS Safari and Android)
        const file = new File([blob], filename, { type: 'image/png' })
        const shareData = { files: [file] }

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData)
            setDownloading(false)
            return
          } catch (shareErr) {
            // User cancelled or share failed, fall through to download
            if ((shareErr as Error).name === 'AbortError') {
              setDownloading(false)
              return
            }
          }
        }
      }

      // Fallback: Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename

      // For iOS Safari fallback - open in new tab
      if (isMobile && /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)) {
        // iOS Safari: open image in new tab for manual save
        window.open(url, '_blank')
      } else {
        // Desktop and Android Chrome: trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error('Failed to download QR:', err)
      alert('ไม่สามารถดาวน์โหลดได้ กรุณาลองใหม่')
    } finally {
      setDownloading(false)
    }
  }, [shopSlug, downloading])

  return (
    <div className="text-center">
      {showTitle && (
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">{title}</h3>
      )}

      {instruction && (
        <p className="text-[#7a6f63] text-sm mb-4">{instruction}</p>
      )}

      {/* QR Code */}
      <div
        ref={qrRef}
        className="inline-block p-4 bg-white rounded-[16px] border border-[#e8e2da] mb-4"
      >
        <QRCodeCanvas
          value={shopUrl}
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Shop URL */}
      <p className="text-sm font-medium text-[#7a6f63] mb-4">{displayUrl}</p>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {/* Download Button (icon only) */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="p-3 bg-[#1a1a1a] text-white rounded-[12px] hover:bg-[#333] transition-colors disabled:opacity-50"
          title="ดาวน์โหลด QR"
        >
          {downloading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
        </button>

        {/* Copy Button (text) */}
        <button
          onClick={handleCopy}
          className="px-4 py-3 border border-[#e8e2da] text-[#1a1a1a] rounded-[12px] hover:bg-white/50 transition-colors font-medium text-sm"
        >
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </button>
      </div>
    </div>
  )
}
