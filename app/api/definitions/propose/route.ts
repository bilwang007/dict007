import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// POST: Propose a new definition (creates pending definition for admin review)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      word,
      targetLanguage,
      nativeLanguage,
      definitionTarget,
      definition,
      exampleSentence1,
      exampleSentence2,
      exampleTranslation1,
      exampleTranslation2,
      usageNote,
      isValidWord,
      suggestedWord,
    } = body

    if (!word || !targetLanguage || !nativeLanguage || !definitionTarget || !definition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if approved definition already exists
    const { data: existing } = await supabase
      .from('word_definitions')
      .select('id')
      .eq('word', word)
      .eq('target_language', targetLanguage)
      .eq('native_language', nativeLanguage)
      .eq('status', 'approved')
      .single()

    if (existing) {
      // Create pending definition for admin to review
      const { data, error } = await supabase
        .from('word_definitions')
        .insert({
          word,
          target_language: targetLanguage,
          native_language: nativeLanguage,
          definition_target: definitionTarget,
          definition,
          example_sentence_1: exampleSentence1 || '',
          example_sentence_2: exampleSentence2 || '',
          example_translation_1: exampleTranslation1 || '',
          example_translation_2: exampleTranslation2 || '',
          usage_note: usageNote || null,
          is_valid_word: isValidWord ?? true,
          suggested_word: suggestedWord || null,
          status: 'pending',
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error proposing definition:', error)
        return NextResponse.json(
          { error: 'Failed to propose definition' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Definition proposed for admin review',
        definition: data,
      })
    } else {
      // No existing definition, create as approved (first definition)
      const { data, error } = await supabase
        .from('word_definitions')
        .insert({
          word,
          target_language: targetLanguage,
          native_language: nativeLanguage,
          definition_target: definitionTarget,
          definition,
          example_sentence_1: exampleSentence1 || '',
          example_sentence_2: exampleSentence2 || '',
          example_translation_1: exampleTranslation1 || '',
          example_translation_2: exampleTranslation2 || '',
          usage_note: usageNote || null,
          is_valid_word: isValidWord ?? true,
          suggested_word: suggestedWord || null,
          status: 'approved',
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating definition:', error)
        return NextResponse.json(
          { error: 'Failed to create definition' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Definition created',
        definition: data,
      })
    }
  } catch (error: any) {
    console.error('Propose definition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

