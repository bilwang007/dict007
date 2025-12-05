import { NextRequest, NextResponse } from 'next/server'
import { generateStory } from '@/app/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { words, nativeLanguage, targetLanguage } = body

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Words array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!nativeLanguage) {
      return NextResponse.json(
        { error: 'Native language is required' },
        { status: 400 }
      )
    }

    // Use explicitly provided targetLanguage or get from words
    const targetLang = targetLanguage || words[0]?.targetLanguage || 'en'

    const result = await generateStory(words, nativeLanguage, targetLang)

    return NextResponse.json({
      story: result.story,
      translation: result.translation,
    })
  } catch (error) {
    console.error('Error generating story:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate story' 
      },
      { status: 500 }
    )
  }
}