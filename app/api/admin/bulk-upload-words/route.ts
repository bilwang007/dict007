import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// POST: Bulk upload word definitions (admin only)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
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
        { error: 'Missing required fields: word, targetLanguage, nativeLanguage, definitionTarget, definition' },
        { status: 400 }
      )
    }

    // Check if definition already exists
    const { data: existing } = await supabase
      .from('word_definitions')
      .select('id')
      .eq('word', word)
      .eq('target_language', targetLanguage)
      .eq('native_language', nativeLanguage)
      .eq('status', 'approved')
      .single()

    if (existing) {
      // Word already exists, skip
      return NextResponse.json({
        success: true,
        message: 'Word already exists, skipped',
        skipped: true,
      })
    }

    // Insert new definition (auto-approved for bulk uploads)
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
        status: 'approved', // Auto-approve bulk uploads
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate key error (unique constraint violation)
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Word already exists, skipped',
          skipped: true,
        })
      }
      console.error('Error uploading word:', error)
      return NextResponse.json(
        { error: 'Failed to upload word', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Word uploaded successfully',
      definition: data,
    })
  } catch (error: any) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

