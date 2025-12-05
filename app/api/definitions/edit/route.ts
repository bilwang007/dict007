import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// POST: Save user's custom definition edit
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
      wordDefinitionId, 
      definitionTarget, 
      definition, 
      exampleSentence1, 
      exampleSentence2,
      exampleTranslation1,
      exampleTranslation2,
      usageNote 
    } = body

    if (!wordDefinitionId) {
      return NextResponse.json(
        { error: 'wordDefinitionId is required' },
        { status: 400 }
      )
    }

    // Upsert user's custom edit
    const { data, error } = await supabase
      .from('user_definition_edits')
      .upsert({
        user_id: user.id,
        word_definition_id: wordDefinitionId,
        definition_target: definitionTarget || null,
        definition: definition || null,
        example_sentence_1: exampleSentence1 || null,
        example_sentence_2: exampleSentence2 || null,
        example_translation_1: exampleTranslation1 || null,
        example_translation_2: exampleTranslation2 || null,
        usage_note: usageNote || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,word_definition_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving user edit:', error)
      return NextResponse.json(
        { error: 'Failed to save edit' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      edit: data,
    })
  } catch (error: any) {
    console.error('Edit definition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove user's custom edit (revert to base definition)
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
    const wordDefinitionId = searchParams.get('wordDefinitionId')

    if (!wordDefinitionId) {
      return NextResponse.json(
        { error: 'wordDefinitionId is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('user_definition_edits')
      .delete()
      .eq('user_id', user.id)
      .eq('word_definition_id', wordDefinitionId)

    if (error) {
      console.error('Error deleting user edit:', error)
      return NextResponse.json(
        { error: 'Failed to delete edit' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Edit removed, using base definition',
    })
  } catch (error: any) {
    console.error('Delete edit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

