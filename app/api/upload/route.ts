import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getAliyunDriveClient } from '@/app/lib/aliyun-drive'

// Rate limiting: 10 uploads per minute per user
const uploadLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limit = uploadLimits.get(userId)

  if (!limit || now > limit.resetAt) {
    uploadLimits.set(userId, { count: 1, resetAt: now + 60000 }) // 1 minute
    return true
  }

  if (limit.count >= 10) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'images'
    const fileName = formData.get('fileName') as string || file.name

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: images (jpeg, png, gif, webp) and audio (mpeg, wav, ogg)' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Upload to 阿里云盘
    const aliyunDrive = getAliyunDriveClient()
    const folderPath = `/ai-dictionary/${folder}`
    
    let fileUrl: string
    try {
      if (file.type.startsWith('image/')) {
        fileUrl = await aliyunDrive.uploadImage(file, fileName)
      } else if (file.type.startsWith('audio/')) {
        fileUrl = await aliyunDrive.uploadAudio(file, fileName)
      } else {
        fileUrl = await aliyunDrive.uploadFile(file, fileName, folderPath)
      }
    } catch (error: any) {
      console.error('阿里云盘 upload error:', error)
      return NextResponse.json(
        { error: `Upload failed: ${error.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

