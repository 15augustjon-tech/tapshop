import { createClient } from '@supabase/supabase-js'

const BUCKET_NAME = 'product-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload a product image to Supabase Storage
 * @param file - The image file to upload
 * @param sellerId - The seller's ID (used for organizing files)
 */
export async function uploadProductImage(
  file: File,
  sellerId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB'
    }
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'รองรับเฉพาะไฟล์ jpg, png, webp'
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${sellerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'อัพโหลดไม่สำเร็จ กรุณาลองใหม่'
    }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)

  return {
    success: true,
    url: publicUrl
  }
}

/**
 * Delete a product image from Supabase Storage
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`)

    if (pathParts.length < 2) {
      return false
    }

    const filePath = pathParts[1]

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete image error:', error)
    return false
  }
}
