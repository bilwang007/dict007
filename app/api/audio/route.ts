import { NextRequest, NextResponse } from 'next/server'
import { generateAudio } from '@/app/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, language } = body

    if (!text || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: text, language' },
        { status: 400 }
      )
    }

    // Generate audio
    const audioBuffer = await generateAudio(text, language)

    // Check if buffer is empty (fallback was used)
    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Audio generation not available. Browser TTS will be used as fallback.' },
        { status: 503 } // Service Unavailable - signals to use browser TTS
      )
    }

    // Return audio as response
    // Convert Buffer to ArrayBuffer for NextResponse
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset, 
      audioBuffer.byteOffset + audioBuffer.byteLength
    ) as ArrayBuffer
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Audio generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    )
  }
}
