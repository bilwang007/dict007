import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { rateLimit, getRateLimitKey, RATE_LIMITS } from '@/app/lib/rate-limit'

// GET: Fetch all notebook entries for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const key = getRateLimitKey(request, user.id)
    const limit = rateLimit(key, RATE_LIMITS.API_GENERAL.maxRequests, RATE_LIMITS.API_GENERAL.windowMs)
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { data, error } = await supabase
      .from('notebook_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notebook entries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch entries' },
        { status: 500 }
      )
    }

    // Transform to app format
    const entries = (data || []).map(entry => ({
      id: entry.id,
      word: entry.word,
      targetLanguage: entry.target_language,
      nativeLanguage: entry.native_language,
      definition: entry.definition,
      definitionTarget: entry.definition_target || undefined,
      imageUrl: entry.image_url || undefined,
      audioUrl: entry.audio_url || undefined,
      exampleSentence1: entry.example_sentence_1,
      exampleSentence2: entry.example_sentence_2,
      exampleTranslation1: entry.example_translation_1,
      exampleTranslation2: entry.example_translation_2,
      usageNote: entry.usage_note || '',
      tags: entry.tags || undefined,
      firstLearnedDate: entry.first_learned_date || entry.created_at,
      createdAt: entry.created_at,
    }))

    return NextResponse.json({ entries })
  } catch (error: any) {
    console.error('Notebook API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new notebook entry
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

    // Rate limiting
    const key = getRateLimitKey(request, user.id)
    const limit = rateLimit(key, RATE_LIMITS.API_GENERAL.maxRequests, RATE_LIMITS.API_GENERAL.windowMs)
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      word,
      targetLanguage,
      nativeLanguage,
      definition,
      definitionTarget,
      imageUrl,
      audioUrl,
      exampleSentence1,
      exampleSentence2,
      exampleTranslation1,
      exampleTranslation2,
      usageNote,
      tags,
      replaceExisting = false,
    } = body

    // Input validation
    if (!word || !targetLanguage || !nativeLanguage || !definition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if entry exists
    const { data: existing } = await supabase
      .from('notebook_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('word', word)
      .eq('target_language', targetLanguage)
      .eq('native_language', nativeLanguage)
      .single()

    const entryData = {
      user_id: user.id,
      word: word.trim(),
      target_language: targetLanguage,
      native_language: nativeLanguage,
      definition: definition.trim(),
      definition_target: definitionTarget || null,
      image_url: imageUrl || null,
      audio_url: audioUrl || null,
      example_sentence_1: exampleSentence1 || '',
      example_sentence_2: exampleSentence2 || '',
      example_translation_1: exampleTranslation1 || '',
      example_translation_2: exampleTranslation2 || '',
      usage_note: usageNote || '',
      tags: tags || [],
    }

    if (existing && replaceExisting) {
      // Update existing entry
      const { data, error } = await supabase
        .from('notebook_entries')
        .update(entryData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating entry:', error)
        return NextResponse.json(
          { error: 'Failed to update entry' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        entry: {
          id: data.id,
          word: data.word,
          targetLanguage: data.target_language,
          nativeLanguage: data.native_language,
          definition: data.definition,
          definitionTarget: data.definition_target || undefined,
          imageUrl: data.image_url || undefined,
          audioUrl: data.audio_url || undefined,
          exampleSentence1: data.example_sentence_1,
          exampleSentence2: data.example_sentence_2,
          exampleTranslation1: data.example_translation_1,
          exampleTranslation2: data.example_translation_2,
          usageNote: data.usage_note || '',
          tags: data.tags || undefined,
          firstLearnedDate: existing.first_learned_date || existing.created_at,
          createdAt: existing.created_at,
        },
      })
    } else if (existing && !replaceExisting) {
      // Return existing without updating
      return NextResponse.json({
        success: true,
        entry: {
          id: existing.id,
          word: existing.word,
          targetLanguage: existing.target_language,
          nativeLanguage: existing.native_language,
          definition: existing.definition,
          definitionTarget: existing.definition_target || undefined,
          imageUrl: existing.image_url || undefined,
          audioUrl: existing.audio_url || undefined,
          exampleSentence1: existing.example_sentence_1,
          exampleSentence2: existing.example_sentence_2,
          exampleTranslation1: existing.example_translation_1,
          exampleTranslation2: existing.example_translation_2,
          usageNote: existing.usage_note || '',
          tags: existing.tags || undefined,
          firstLearnedDate: existing.first_learned_date || existing.created_at,
          createdAt: existing.created_at,
        },
        exists: true,
      })
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('notebook_entries')
        .insert(entryData)
        .select()
        .single()

      if (error) {
        console.error('Error creating entry:', error)
        return NextResponse.json(
          { error: 'Failed to create entry' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        entry: {
          id: data.id,
          word: data.word,
          targetLanguage: data.target_language,
          nativeLanguage: data.native_language,
          definition: data.definition,
          definitionTarget: data.definition_target || undefined,
          imageUrl: data.image_url || undefined,
          audioUrl: data.audio_url || undefined,
          exampleSentence1: data.example_sentence_1,
          exampleSentence2: data.example_sentence_2,
          exampleTranslation1: data.example_translation_1,
          exampleTranslation2: data.example_translation_2,
          usageNote: data.usage_note || '',
          tags: data.tags || undefined,
          firstLearnedDate: data.first_learned_date || data.created_at,
          createdAt: data.created_at,
        },
      })
    }
  } catch (error: any) {
    console.error('Notebook POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a notebook entry
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing entry ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('notebook_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting entry:', error)
      return NextResponse.json(
        { error: 'Failed to delete entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Notebook DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
