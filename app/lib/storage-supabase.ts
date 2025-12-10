// Supabase-based storage for notebook entries and stories
// This replaces localStorage-based storage in storage.ts

import { createClient } from './supabase/client'
import type { NotebookEntry, Story } from './types'

// Notebook operations
export async function getNotebookEntries(): Promise<NotebookEntry[]> {
  const supabase = createClient()
  
  // Get current user - use getSession() for client-side
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('User not authenticated')
  }
  const user = session.user

  // Add timeout to prevent hanging
  const queryPromise = supabase
    .from('notebook_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
  )

  let data, error
  try {
    const result = await Promise.race([queryPromise, timeoutPromise])
    data = (result as any).data
    error = (result as any).error
  } catch (err: any) {
    console.error('❌ Notebook query timeout or error:', err)
    error = { message: err.message || 'Query failed', code: err.code || 'TIMEOUT' }
    data = null
  }

  if (error) {
    console.error('Error fetching notebook entries:', error)
    // If table doesn't exist, return empty array instead of throwing
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.warn('⚠️ notebook_entries table does not exist. Returning empty array.')
      return []
    }
    throw error
  }

  // Transform database format to app format
  return (data || []).map((entry: any) => ({
    id: entry.id,
    word: entry.word,
    phonetic: entry.phonetic || undefined,
    targetLanguage: entry.target_language,
    nativeLanguage: entry.native_language,
    definition: entry.definition,
    definitionTarget: entry.definition_target || undefined,
    meaningIndex: entry.meaning_index !== null && entry.meaning_index !== undefined ? entry.meaning_index : undefined,
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
}

export async function saveNotebookEntry(
  entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'firstLearnedDate'>, 
  replaceExisting = false
): Promise<NotebookEntry> {
  const supabase = createClient()
  
  // Get current user - use getSession() for client-side
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('User not authenticated')
  }
  const user = session.user

  // Check if entry already exists (include meaningIndex if provided)
  const query = supabase
    .from('notebook_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('word', entry.word)
    .eq('target_language', entry.targetLanguage)
    .eq('native_language', entry.nativeLanguage)
  
  // If meaningIndex is provided, also match on that to store meanings separately
  // Database schema must have meaning_index column - proper architecture requires correct schema
  if ((entry as any).meaningIndex !== undefined) {
    query.eq('meaning_index', (entry as any).meaningIndex)
  } else {
    // If no meaningIndex, only match entries without meaningIndex (null)
    query.is('meaning_index', null)
  }
  
  const { data: existing, error: queryError } = await query.maybeSingle()
  
  // If query fails due to missing column, database schema is incorrect
  // The proper fix is to run the migration, not work around it in code
  if (queryError) {
    if (queryError.code === '42703' || queryError.message?.includes('meaning_index')) {
      console.error('❌ Database schema error: meaning_index column missing.')
      console.error('   Please run migration: migrate_to_complete_schema.sql')
      throw new Error('Database schema is incomplete. Please run the migration to add meaning_index column.')
    }
    throw queryError
  }

  if (existing && !replaceExisting) {
    // Return existing entry
    return {
      id: existing.id,
      word: existing.word,
      phonetic: existing.phonetic || undefined,
      targetLanguage: existing.target_language,
      nativeLanguage: existing.native_language,
      definition: existing.definition,
      definitionTarget: existing.definition_target || undefined,
      meaningIndex: existing.meaning_index !== null && existing.meaning_index !== undefined ? existing.meaning_index : undefined,
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
    }
  }

  const entryData = {
    user_id: user.id,
    word: entry.word,
    phonetic: (entry as any).phonetic || null,
    target_language: entry.targetLanguage,
    native_language: entry.nativeLanguage,
    definition: entry.definition,
    definition_target: entry.definitionTarget || null,
    meaning_index: (entry as any).meaningIndex !== undefined ? (entry as any).meaningIndex : null,
    image_url: entry.imageUrl || null,
    audio_url: entry.audioUrl || null,
    example_sentence_1: entry.exampleSentence1,
    example_sentence_2: entry.exampleSentence2,
    example_translation_1: entry.exampleTranslation1,
    example_translation_2: entry.exampleTranslation2,
    usage_note: entry.usageNote || '',
    tags: entry.tags || [],
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
      if (error.code === '42703' || error.message?.includes('meaning_index')) {
        console.error('❌ Database schema error: meaning_index column missing.')
        console.error('   Please run migration: migrate_to_complete_schema.sql')
        throw new Error('Database schema is incomplete. Please run the migration.')
      }
      console.error('Error updating notebook entry:', error)
      throw error
    }

    return {
      id: data.id,
      word: data.word,
      phonetic: data.phonetic || undefined,
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
      meaningIndex: data.meaning_index !== null && data.meaning_index !== undefined ? data.meaning_index : undefined,
      usageNote: data.usage_note || '',
      tags: data.tags || undefined,
      firstLearnedDate: existing.first_learned_date || existing.created_at,
      createdAt: existing.created_at,
    }
  } else {
    // Insert new entry
    const { data, error } = await supabase
      .from('notebook_entries')
      .insert(entryData)
      .select()
      .single()

    if (error) {
      if (error.code === '42703' || error.message?.includes('meaning_index')) {
        console.error('❌ Database schema error: meaning_index column missing.')
        console.error('   Please run migration: migrate_to_complete_schema.sql')
        throw new Error('Database schema is incomplete. Please run the migration.')
      }
      console.error('Error saving notebook entry:', error)
      throw error
    }

    return {
      id: data.id,
      word: data.word,
      phonetic: data.phonetic || undefined,
      targetLanguage: data.target_language,
      nativeLanguage: data.native_language,
      definition: data.definition,
      definitionTarget: data.definition_target || undefined,
      meaningIndex: data.meaning_index !== null && data.meaning_index !== undefined ? data.meaning_index : undefined,
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
    }
  }
}

export async function deleteNotebookEntry(id: string): Promise<boolean> {
  const supabase = createClient()
  
  // Get current user - use getSession() for client-side
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('User not authenticated')
  }
  const user = session.user

  const { error } = await supabase
    .from('notebook_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting notebook entry:', error)
    throw error
  }

  return true
}

export async function isNotebookEntrySaved(
  word: string,
  targetLanguage: string,
  nativeLanguage: string
): Promise<boolean> {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('notebook_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('word', word)
    .eq('target_language', targetLanguage)
    .eq('native_language', nativeLanguage)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking notebook entry:', error)
    return false
  }

  return !!data
}

// Story operations
export async function saveStory(story: Omit<Story, 'id' | 'createdAt'>): Promise<Story> {
  const supabase = createClient()
  
  // Get current user - use getSession() for client-side
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('User not authenticated')
  }
  const user = session.user

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: user.id,
      content: story.content,
      translation: story.translation,
      words_used: story.wordsUsed,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving story:', error)
    throw error
  }

  return {
    id: data.id,
    content: data.content,
    translation: data.translation,
    wordsUsed: data.words_used,
    createdAt: data.created_at,
  }
}

export async function getStories(): Promise<Story[]> {
  const supabase = createClient()
  
  // Get current user - use getSession() for client-side
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('User not authenticated')
  }
  const user = session.user

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stories:', error)
    throw error
  }

  return (data || []).map(story => ({
    id: story.id,
    content: story.content,
    translation: story.translation,
    wordsUsed: story.words_used,
    createdAt: story.created_at,
  }))
}

// Tag operations
export async function addTagToEntry(entryId: string, tag: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: entry } = await supabase
    .from('notebook_entries')
    .select('tags')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single()

  if (!entry) {
    return false
  }

  const tags = entry.tags || []
  if (!tags.includes(tag)) {
    tags.push(tag)
    const { error } = await supabase
      .from('notebook_entries')
      .update({ tags })
      .eq('id', entryId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error adding tag:', error)
      throw error
    }
    return true
  }

  return false
}

export async function removeTagFromEntry(entryId: string, tag: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: entry } = await supabase
    .from('notebook_entries')
    .select('tags')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single()

  if (!entry || !entry.tags) {
    return false
  }

  const tags = entry.tags.filter((t: string) => t !== tag)
  const { error } = await supabase
    .from('notebook_entries')
    .update({ tags: tags.length > 0 ? tags : [] })
    .eq('id', entryId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error removing tag:', error)
    throw error
  }

  return true
}

export async function getAllTags(): Promise<string[]> {
  const entries = await getNotebookEntries()
  const tagSet = new Set<string>()
  
  entries.forEach(entry => {
    entry.tags?.forEach(tag => tagSet.add(tag))
  })
  
  return Array.from(tagSet).sort()
}

export async function getEntriesByTag(tag: string): Promise<NotebookEntry[]> {
  const entries = await getNotebookEntries()
  return entries.filter(e => e.tags?.includes(tag))
}

export async function addTagsToEntries(entryIds: string[], tags: string[]): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  let updatedCount = 0
  for (const entryId of entryIds) {
    const { data: entry } = await supabase
      .from('notebook_entries')
      .select('tags')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single()

    if (entry) {
      const currentTags = entry.tags || []
      let entryUpdated = false
      const newTags = [...currentTags]
      
      tags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag)
          entryUpdated = true
        }
      })

      if (entryUpdated) {
        const { error } = await supabase
          .from('notebook_entries')
          .update({ tags: newTags })
          .eq('id', entryId)
          .eq('user_id', user.id)

        if (!error) {
          updatedCount++
        }
      }
    }
  }

  return updatedCount
}

export async function removeTagsFromEntries(entryIds: string[], tags: string[]): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  let updatedCount = 0
  for (const entryId of entryIds) {
    const { data: entry } = await supabase
      .from('notebook_entries')
      .select('tags')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single()

    if (entry && entry.tags) {
      const currentTags = entry.tags
      const newTags = currentTags.filter((t: string) => !tags.includes(t))
      
      if (newTags.length !== currentTags.length) {
        const { error } = await supabase
          .from('notebook_entries')
          .update({ tags: newTags.length > 0 ? newTags : [] })
          .eq('id', entryId)
          .eq('user_id', user.id)

        if (!error) {
          updatedCount++
        }
      }
    }
  }

  return updatedCount
}

