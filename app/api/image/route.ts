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
    
    const imageUrl = await generateImage(prompt, meaningContext || definition)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', imageUrl: '' },
      { status: 500 }
    )
  }
}

