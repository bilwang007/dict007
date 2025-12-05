// localStorage-based storage for notebook entries and stories

import type { NotebookEntry, Story } from './types'

const NOTEBOOK_STORAGE_KEY = 'dictionary_notebook_entries'
const STORIES_STORAGE_KEY = 'dictionary_stories'

// Notebook operations
export function getNotebookEntries(): NotebookEntry[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(NOTEBOOK_STORAGE_KEY)
    if (!stored) {
      console.log('No notebook entries in localStorage')
      return []
    }
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      console.error('Notebook entries is not an array:', parsed)
      return []
    }
    console.log('Loaded', parsed.length, 'notebook entries from localStorage')
    return parsed
  } catch (error) {
    console.error('Error reading notebook from localStorage:', error)
    // Clear corrupted data
    try {
      localStorage.removeItem(NOTEBOOK_STORAGE_KEY)
    } catch (e) {
      // Ignore errors clearing corrupted data
    }
    return []
  }
}

export function saveNotebookEntry(entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'firstLearnedDate'>, replaceExisting = false): NotebookEntry {
  const entries = getNotebookEntries()
  
  // Check if entry already exists
  const existingIndex = entries.findIndex(
    e => e.word === entry.word && 
         e.targetLanguage === entry.targetLanguage && 
         e.nativeLanguage === entry.nativeLanguage
  )
  
  if (existingIndex !== -1) {
    if (replaceExisting) {
      // Replace existing entry with new data, but keep original id, createdAt, and firstLearnedDate
      const existing = entries[existingIndex]
      const updatedEntry: NotebookEntry = {
        ...entry,
        id: existing.id,
        createdAt: existing.createdAt, // Keep original creation date
        firstLearnedDate: existing.firstLearnedDate || existing.createdAt, // Preserve first learned date
        tags: entry.tags || existing.tags || [], // Merge tags if provided
      }
      entries[existingIndex] = updatedEntry
      localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(entries))
      return updatedEntry
    } else {
      // Return existing without replacing
      return entries[existingIndex]
    }
  }
  
  const newEntry: NotebookEntry = {
    ...entry,
    id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    firstLearnedDate: new Date().toISOString(), // Track when first learned
    tags: entry.tags || [], // Initialize tags if not provided
  }
  
  entries.push(newEntry)
  localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(entries))
  return newEntry
}

export function deleteNotebookEntry(id: string): boolean {
  const entries = getNotebookEntries()
  const filtered = entries.filter(e => e.id !== id)
  
  if (filtered.length === entries.length) {
    return false // Entry not found
  }
  
  localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function isNotebookEntrySaved(
  word: string,
  targetLanguage: string,
  nativeLanguage: string
): boolean {
  const entries = getNotebookEntries()
  return entries.some(
    e => e.word === word && 
         e.targetLanguage === targetLanguage && 
         e.nativeLanguage === nativeLanguage
  )
}

// Story operations
export function saveStory(story: Omit<Story, 'id' | 'createdAt'>): Story {
  const stories = getStories()
  
  const newStory: Story = {
    ...story,
    id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  
  stories.push(newStory)
  localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories))
  return newStory
}

export function getStories(): Story[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORIES_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error reading stories from localStorage:', error)
    return []
  }
}

// Tag operations
export function addTagToEntry(entryId: string, tag: string): boolean {
  const entries = getNotebookEntries()
  const entry = entries.find(e => e.id === entryId)
  if (!entry) return false
  
  if (!entry.tags) entry.tags = []
  if (!entry.tags.includes(tag)) {
    entry.tags.push(tag)
    localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(entries))
    return true
  }
  return false
}

export function removeTagFromEntry(entryId: string, tag: string): boolean {
  const entries = getNotebookEntries()
  const entry = entries.find(e => e.id === entryId)
  if (!entry || !entry.tags) return false
  
  const index = entry.tags.indexOf(tag)
  if (index !== -1) {
    entry.tags.splice(index, 1)
    localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(entries))
    return true
  }
  return false
}

export function addTagsToEntries(entryIds: string[], tags: string[]): number {
  const entries = getNotebookEntries()
  let updatedCount = 0
  
  entries.forEach(entry => {
    if (entryIds.includes(entry.id)) {
      if (!entry.tags) entry.tags = []
      let entryUpdated = false
      tags.forEach(tag => {
        if (!entry.tags!.includes(tag)) {
          entry.tags!.push(tag)
          entryUpdated = true
        }
      })
      if (entryUpdated) updatedCount++
    }
  })
  
  if (updatedCount > 0) {
    localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(entries))
  }
  
  return updatedCount
}

export function removeTagsFromEntries(entryIds: string[], tags: string[]): number {
  const entries = getNotebookEntries()
  let updatedCount = 0
  
  entries.forEach(entry => {
    if (entryIds.includes(entry.id) && entry.tags) {
      let entryUpdated = false
      tags.forEach(tag => {
        const index = entry.tags!.indexOf(tag)
        if (index !== -1) {
          entry.tags!.splice(index, 1)
          entryUpdated = true
        }
      })
      if (entryUpdated) {
        updatedCount++
        // Clean up empty tags array
        if (entry.tags!.length === 0) {
          entry.tags = undefined
        }
      }
    }
  })
  
  if (updatedCount > 0) {
    localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(entries))
  }
  
  return updatedCount
}

export function getEntriesByTag(tag: string): NotebookEntry[] {
  return getNotebookEntries().filter(e => e.tags?.includes(tag))
}

export function getAllTags(): string[] {
  const entries = getNotebookEntries()
  const tagSet = new Set<string>()
  
  entries.forEach(entry => {
    entry.tags?.forEach(tag => tagSet.add(tag))
  })
  
  return Array.from(tagSet).sort()
}

export function updateEntryTags(entryId: string, tags: string[]): boolean {
  const entries = getNotebookEntries()
  const entry = entries.find(e => e.id === entryId)
  if (!entry) return false
  
  entry.tags = tags.length > 0 ? tags : undefined
  localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(entries))
  return true
}
