import { NextRequest, NextResponse } from 'next/server'
import { generateDefinition, generateImage } from '@/app/lib/ai'
import { rateLimit, getRateLimitKey, RATE_LIMITS } from '@/app/lib/rate-limit'
import { createClient } from '@/app/lib/supabase/server'
import type { LookupResult, ExampleSentence } from '@/app/lib/types'

// Type for definition result from database or LLM
type DefinitionResult = {
  phonetic?: string
  definitionTarget: string
  definition: string
  examples: ExampleSentence[]
  usageNote: string
  isValidWord?: boolean
  suggestedWord?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Rate limiting
    const key = getRateLimitKey(request, user?.id)
    const limit = rateLimit(key, RATE_LIMITS.API_LOOKUP.maxRequests, RATE_LIMITS.API_LOOKUP.windowMs)
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: limit.resetAt 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.API_LOOKUP.maxRequests.toString(),
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetAt?.toString() || '',
          }
        }
      )
    }

    const body = await request.json()
    const { word, targetLanguage, nativeLanguage, forceAI, skipImage } = body

    // Input validation
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid word parameter' },
        { status: 400 }
      )
    }

    if (!targetLanguage || !nativeLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: targetLanguage, nativeLanguage' },
        { status: 400 }
      )
    }

    // Sanitize input (basic)
    const sanitizedWord = word.trim().substring(0, 100) // Limit length

    // Step 1: Check database first (database-first lookup), unless forceAI is true
    let definitionResult: DefinitionResult | null = null
    let source: 'database' | 'user_edit' | 'llm' = 'llm' // Track where definition came from
    let wordDefinitionId: string | null = null
    
    // Skip database lookup if forceAI is true
    if (!forceAI) {
      // First, check for approved definition in database
      const { data: dbDefinition } = await supabase
        .from('word_definitions')
        .select('*')
        .eq('word', sanitizedWord)
        .eq('target_language', targetLanguage)
        .eq('native_language', nativeLanguage)
        .eq('status', 'approved')
        .single()

      if (dbDefinition) {
      wordDefinitionId = dbDefinition.id
      
      // Check for user's custom edit if authenticated
      if (user) {
        const { data: userEdit } = await supabase
          .from('user_definition_edits')
          .select('*')
          .eq('user_id', user.id)
          .eq('word_definition_id', dbDefinition.id)
          .single()

        if (userEdit) {
          // Use user's custom edit
          definitionResult = {
            phonetic: dbDefinition.phonetic || undefined,
            definitionTarget: userEdit.definition_target || dbDefinition.definition_target,
            definition: userEdit.definition || dbDefinition.definition,
            examples: [
              {
                sentence: userEdit.example_sentence_1 || dbDefinition.example_sentence_1,
                translation: userEdit.example_translation_1 || dbDefinition.example_translation_1,
              },
              {
                sentence: userEdit.example_sentence_2 || dbDefinition.example_sentence_2,
                translation: userEdit.example_translation_2 || dbDefinition.example_translation_2,
              },
            ],
            usageNote: userEdit.usage_note || dbDefinition.usage_note || '',
            isValidWord: dbDefinition.is_valid_word ?? true,
            suggestedWord: dbDefinition.suggested_word,
          }
          source = 'user_edit'
        } else {
          // Use base definition
          definitionResult = {
            phonetic: dbDefinition.phonetic || undefined,
            definitionTarget: dbDefinition.definition_target,
            definition: dbDefinition.definition,
            examples: [
              {
                sentence: dbDefinition.example_sentence_1,
                translation: dbDefinition.example_translation_1,
              },
              {
                sentence: dbDefinition.example_sentence_2,
                translation: dbDefinition.example_translation_2,
              },
            ],
            usageNote: dbDefinition.usage_note || '',
            isValidWord: dbDefinition.is_valid_word ?? true,
            suggestedWord: dbDefinition.suggested_word,
          }
          source = 'database'
        }
      } else {
        // Non-authenticated: use base definition
        definitionResult = {
          phonetic: dbDefinition.phonetic || undefined,
          definitionTarget: dbDefinition.definition_target,
          definition: dbDefinition.definition,
          examples: [
            {
              sentence: dbDefinition.example_sentence_1,
              translation: dbDefinition.example_translation_1,
            },
            {
              sentence: dbDefinition.example_sentence_2,
              translation: dbDefinition.example_translation_2,
            },
          ],
          usageNote: dbDefinition.usage_note || '',
          isValidWord: dbDefinition.is_valid_word ?? true,
          suggestedWord: dbDefinition.suggested_word,
        }
        source = 'database'
      }
      }
    }

    // Step 2: If not found in database (or forceAI is true), generate with LLM
    if (!definitionResult) {
      source = 'llm'
      const llmResult = await generateDefinition(sanitizedWord, targetLanguage, nativeLanguage)
      // Cast to DefinitionResult since generateDefinition returns compatible structure
      definitionResult = llmResult as DefinitionResult
      
      // NOTE: We do NOT automatically save to the shared dictionary (word_definitions).
      // The shared dictionary should only be populated by:
      // 1. Admin bulk uploads
      // 2. Admin-approved definitions
      // 3. Manual admin actions
      // 
      // Personal notebook entries (notebook_entries) are separate and user-specific.
      // When a user saves a word to their notebook, it goes to notebook_entries only.
      // When a user deletes from their notebook, it does NOT affect the shared dictionary.
      // 
      // This ensures the shared dictionary remains curated and high-quality,
      // while users can still save words to their personal notebooks.
    }

    // Return response immediately with definition
    // Image will be fetched separately via /api/image endpoint
    // definitionResult is guaranteed to be non-null here (either from DB or LLM)
    if (!definitionResult) {
      return NextResponse.json(
        { error: 'Failed to generate definition' },
        { status: 500 }
      )
    }

    // Start image generation but don't wait for it - return response immediately
    // Image will be loaded asynchronously on client side
    // Skip image generation if skipImage is true (for faster regeneration)
    if (!skipImage) {
      generateImage(`${sanitizedWord} - ${definitionResult.definition.substring(0, 100)}`)
        .then(imageUrl => {
          console.log('Image generated in background:', imageUrl)
        })
        .catch(err => {
          console.error('Image generation failed:', err)
        })
    }
    
    const result: LookupResult = {
      word: sanitizedWord,
      phonetic: definitionResult.phonetic || undefined,
      definitionTarget: definitionResult.definitionTarget || '',
      definition: definitionResult.definition,
      imageUrl: '', // Will be loaded separately
      examples: definitionResult.examples,
      usageNote: definitionResult.usageNote,
      isValidWord: definitionResult.isValidWord,
      suggestedWord: definitionResult.suggestedWord,
      source, // 'database', 'user_edit', or 'llm'
      wordDefinitionId: wordDefinitionId || undefined, // For editing functionality
      targetLanguage, // Add target language
      nativeLanguage, // Add native language
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup word' },
      { status: 500 }
    )
  }
}
