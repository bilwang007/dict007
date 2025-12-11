import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/app/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { word, definition, meaningContext } = body

    if (!word) {
      return NextResponse.json(
        { error: 'Missing required field: word' },
        { status: 400 }
      )
    }

    // Generate image using meaning explanation instead of just the word
    // If meaningContext is provided, use it as the primary prompt (it contains the specific meaning explanation)
    // Otherwise fall back to definition
    const prompt = meaningContext 
      ? `${meaningContext.substring(0, 150)}` // Use meaning explanation directly
      : definition 
        ? `${definition.substring(0, 150)}` // Fall back to definition
        : word // Last resort: just the word
    
    // Add timeout for image generation (10 seconds)
    const imageUrl = await Promise.race([
      generateImage(prompt, meaningContext || definition),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Image generation timeout')), 10000)
      )
    ])

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image'
    return NextResponse.json(
      { error: errorMessage, imageUrl: '' },
      { status: 500 }
    )
  }
}

