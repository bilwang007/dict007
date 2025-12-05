import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/app/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { word, definition } = body

    if (!word) {
      return NextResponse.json(
        { error: 'Missing required field: word' },
        { status: 400 }
      )
    }

    // Generate image
    const imageUrl = await generateImage(`${word} - ${(definition || '').substring(0, 100)}`)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', imageUrl: '' },
      { status: 500 }
    )
  }
}

