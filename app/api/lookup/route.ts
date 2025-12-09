import { NextRequest, NextResponse } from 'next/server'
import { generateDefinition, generateImage, fetchWikipediaDefinition, parseMeanings } from '@/app/lib/ai'
import { rateLimit, getRateLimitKey, RATE_LIMITS } from '@/app/lib/rate-limit'
import { createClient } from '@/app/lib/supabase/server'
import type { LookupResult, ExampleSentence, WordMeaning } from '@/app/lib/types'

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

    // Step 0: Check notebook entries first (user's saved words take priority)
    let definitionResult: DefinitionResult | null = null
    let source: 'database' | 'user_edit' | 'llm' | 'wikipedia' | 'notebook' = 'llm' // Track where definition came from
    let wordDefinitionId: string | null = null
    
    if (user && !forceAI) {
      // Check if word exists in user's notebook (get all meanings)
      // Database schema should have meaning_index column - proper architecture requires correct schema
      const { data: notebookEntries, error: notebookError } = await supabase
        .from('notebook_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('word', sanitizedWord)
        .eq('target_language', targetLanguage)
        .eq('native_language', nativeLanguage)
        .order('meaning_index', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false })
      
      // If error due to missing column, database schema is incorrect - fix at DB level
      if (notebookError && (notebookError.code === '42703' || notebookError.message?.includes('meaning_index'))) {
        console.error('❌ Database schema error: meaning_index column missing.')
        console.error('   Please run migration: migrate_to_complete_schema.sql')
        // Continue to database/LLM lookup instead of failing
      } else if (notebookEntries && notebookEntries.length > 0) {
        // If multiple meanings exist, combine them
        // Check if entries have meaning_index (column exists) or are just duplicates
        const hasMeaningIndex = notebookEntries.some(e => e.meaning_index !== null && e.meaning_index !== undefined)
        
        if (notebookEntries.length > 1 && hasMeaningIndex) {
          // Multiple meanings - combine into single result with meanings array
          const firstEntry = notebookEntries[0]
          definitionResult = {
            phonetic: firstEntry.phonetic || undefined,
            definitionTarget: notebookEntries.map(e => 
              e.meaning_index 
                ? `${e.meaning_index}. ${e.definition_target || e.definition || ''}`
                : e.definition_target || e.definition || ''
            ).join(' '),
            definition: notebookEntries.map(e => 
              e.meaning_index 
                ? `${e.meaning_index}. ${e.definition || ''}`
                : e.definition || ''
            ).join(' '),
            examples: notebookEntries.flatMap(entry => [
              {
                sentence: entry.example_sentence_1 || '',
                translation: entry.example_translation_1 || '',
              },
              {
                sentence: entry.example_sentence_2 || '',
                translation: entry.example_translation_2 || '',
              },
            ].filter(ex => ex.sentence.trim() !== '')),
            usageNote: firstEntry.usage_note || '',
            isValidWord: true,
          }
        } else {
          // Single entry
          const entry = notebookEntries[0]
          definitionResult = {
            phonetic: entry.phonetic || undefined,
            definitionTarget: entry.definition_target || entry.definition || '',
            definition: entry.definition || '',
            examples: [
              {
                sentence: entry.example_sentence_1 || '',
                translation: entry.example_translation_1 || '',
              },
              {
                sentence: entry.example_sentence_2 || '',
                translation: entry.example_translation_2 || '',
              },
            ].filter(ex => ex.sentence.trim() !== ''),
            usageNote: entry.usage_note || '',
            isValidWord: true,
          }
        }
        source = 'notebook'
      }
    }
    
    // Step 1: Check database (database-first lookup), unless forceAI is true or notebook entry found
    // Skip database lookup if forceAI is true or notebook entry found
    if (!definitionResult && !forceAI) {
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

    // Step 2: If not found in database/notebook (or forceAI is true), fetch from Wikipedia first, then use LLM
    if (!definitionResult) {
      // Try to fetch from Wikipedia first for fast initial response
      const wikiResult = await fetchWikipediaDefinition(sanitizedWord, targetLanguage)
      
      if (wikiResult) {
        // Return Wikipedia definition immediately, then generate examples with LLM
        // For now, we'll return Wikipedia definition and generate examples
        // In a streaming version, we'd return Wikipedia first, then stream LLM examples
        source = 'wikipedia'
        
        // Generate examples and usage notes with LLM (this can be done asynchronously)
        // For better UX, we return Wikipedia definition first, then update with LLM examples
        const llmResult = await generateDefinition(
          sanitizedWord, 
          targetLanguage, 
          nativeLanguage,
          wikiResult.definition
        )
        definitionResult = {
          ...llmResult,
          definitionTarget: llmResult.definitionTarget || wikiResult.definition,
          definition: llmResult.definition || '',
        } as DefinitionResult
      } else {
        source = 'llm'
        const llmResult = await generateDefinition(sanitizedWord, targetLanguage, nativeLanguage)
        // Cast to DefinitionResult since generateDefinition returns compatible structure
        definitionResult = llmResult as DefinitionResult
      }
      
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
    // Image will NOT be generated automatically - user must click button
    // definitionResult is guaranteed to be non-null here (either from DB or LLM)
    if (!definitionResult) {
      return NextResponse.json(
        { error: 'Failed to generate definition' },
        { status: 500 }
      )
    }

    // Parse definitions into individual meanings if multiple meanings exist
    const meanings = parseMeanings(
      definitionResult.definitionTarget || '',
      definitionResult.definition || ''
    )
    
    // Distribute examples to correct meanings
    // If examples have meaningIndex, use it; otherwise distribute evenly or by keyword matching
    const distributeExamples = (examples: ExampleSentence[], meanings: Array<{ definitionTarget: string; definition: string }>): ExampleSentence[][] => {
      const examplesPerMeaning: ExampleSentence[][] = meanings.map(() => [])
      
      // Check if examples have meaningIndex
      const examplesWithIndex = examples.filter((ex: any) => ex.meaningIndex !== undefined)
      const examplesWithoutIndex = examples.filter((ex: any) => ex.meaningIndex === undefined)
      
      // Distribute examples with meaningIndex
      examplesWithIndex.forEach((ex: any) => {
        const index = ex.meaningIndex - 1 // Convert to 0-based
        if (index >= 0 && index < examplesPerMeaning.length) {
          examplesPerMeaning[index].push({ sentence: ex.sentence, translation: ex.translation })
        }
      })
      
      // Distribute examples without meaningIndex evenly
      if (examplesWithoutIndex.length > 0) {
        const examplesPerMeaningCount = Math.ceil(examplesWithoutIndex.length / meanings.length)
        examplesWithoutIndex.forEach((ex, idx) => {
          const meaningIndex = Math.floor(idx / examplesPerMeaningCount)
          if (meaningIndex < examplesPerMeaning.length) {
            examplesPerMeaning[meaningIndex].push({ sentence: ex.sentence, translation: ex.translation })
          }
        })
      }
      
      // If no examples were distributed, distribute all examples evenly
      if (examplesPerMeaning.every(arr => arr.length === 0) && examples.length > 0) {
        const examplesPerMeaningCount = Math.ceil(examples.length / meanings.length)
        examples.forEach((ex, idx) => {
          const meaningIndex = Math.floor(idx / examplesPerMeaningCount)
          if (meaningIndex < examplesPerMeaning.length) {
            examplesPerMeaning[meaningIndex].push(ex)
          }
        })
      }
      
      return examplesPerMeaning
    }
    
    const examplesPerMeaning = distributeExamples(definitionResult.examples || [], meanings)
    
    // Create WordMeaning objects for each meaning
    const wordMeanings: WordMeaning[] = meanings.map((meaning, index) => ({
      meaningIndex: index + 1,
      definitionTarget: meaning.definitionTarget,
      definition: meaning.definition,
      examples: examplesPerMeaning[index] || [], // Examples for this specific meaning
      imageUrl: undefined, // Images will be generated on demand
    }))
    
    const result: LookupResult = {
      word: sanitizedWord,
      phonetic: definitionResult.phonetic || undefined,
      definitionTarget: definitionResult.definitionTarget || '',
      definition: definitionResult.definition,
      meanings: wordMeanings.length > 1 ? wordMeanings : undefined, // Only include if multiple meanings
      imageUrl: '', // No automatic image generation
      examples: definitionResult.examples,
      usageNote: definitionResult.usageNote,
      isValidWord: definitionResult.isValidWord,
      suggestedWord: definitionResult.suggestedWord,
      source, // 'database', 'user_edit', 'llm', or 'wikipedia'
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
