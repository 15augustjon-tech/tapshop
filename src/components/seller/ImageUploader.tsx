'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string | null) => void
  error?: string
}

export default function ImageUploader({ value, onChange, error }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('ไฟล์ต้องมีขนาดไม่เกิน 5MB')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('รองรับเฉพาะไฟล์ jpg, png, webp')
      return
    }

    setUploadError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/product-image', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!data.success) {
        setUploadError(data.message || 'อัพโหลดไม่สำเร็จ')
        return
      }

      onChange(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setUploading(false)
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }, [onChange])

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const displayError = error || uploadError

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className={`relative w-full aspect-square border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
          displayError
            ? 'border-error bg-red-50'
            : value
            ? 'border-transparent'
            : 'border-border hover:border-neutral-400 bg-neutral-50'
        }`}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Product image"
              fill
              className="object-cover"
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-secondary">กำลังอัพโหลด...</span>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-neutral-600 font-medium">เพิ่มรูปสินค้า</span>
                <span className="text-secondary text-sm mt-1">jpg, png, webp (ไม่เกิน 5MB)</span>
              </>
            )}
          </div>
        )}
      </button>

      {displayError && (
        <p className="mt-2 text-sm text-error">{displayError}</p>
      )}
    </div>
  )
}
