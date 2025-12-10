'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, CheckSquare, Square, Upload, Tag, X } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import NotebookItem from '../components/NotebookItem'
import StoryView from '../components/StoryView'
import ConfirmModal from '../components/ConfirmModal'
import { 
  getNotebookEntries, 
  deleteNotebookEntry, 
  saveStory, 
  saveNotebookEntry,
  addTagsToEntries,
  removeTagsFromEntries,
  getAllTags
} from '../lib/storage-supabase'
import type { NotebookEntry, Story, LanguageCode } from '../lib/types'
import { LANGUAGES } from '../lib/types'

export default function NotebookPage() {
  const [entries, setEntries] = useState<NotebookEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [story, setStory] = useState<Story | null>(null)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [showBatchUpload, setShowBatchUpload] = useState(false)
  const [showFormUpload, setShowFormUpload] = useState(false)
  const [formWords, setFormWords] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [showBatchTag, setShowBatchTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [recentTags, setRecentTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null)
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('en')
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('zh')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Filter entries based on selected tag or date
  const filteredEntries = entries.filter(entry => {
    // Tag filter
    if (selectedTag && selectedTag !== 'all') {
      // System tags
      if (selectedTag === 'last-3-days') {
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        const entryDate = new Date(entry.createdAt)
        return entryDate >= threeDaysAgo
      } else if (selectedTag === 'last-7-days') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const entryDate = new Date(entry.createdAt)
        return entryDate >= sevenDaysAgo
      } else if (selectedTag === 'last-30-days') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const entryDate = new Date(entry.createdAt)
        return entryDate >= thirtyDaysAgo
      } else {
        // Regular tag filter
        return entry.tags && entry.tags.includes(selectedTag)
      }
    }
    return true
  })

  const fetchEntries = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (typeof window === 'undefined') {
        setEntries([])
        setIsLoading(false)
        return
      }
      
      const data = await getNotebookEntries()
      console.log('Notebook entries loaded:', data.length, data)
      setEntries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching entries:', error)
      setError(error instanceof Error ? error.message : 'Failed to load notebook')
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Load entries on mount
    fetchEntries()
    // Load available tags
    getAllTags()
      .then(tags => setAvailableTags(tags))
      .catch(() => setAvailableTags([]))
    // Load recent tags from localStorage
    const recent = JSON.parse(localStorage.getItem('recentTags') || '[]')
    setRecentTags(recent)
    
    // Safety timeout - ensure loading doesn't last forever
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Notebook loading timeout - stopping loading state')
        setIsLoading(false)
      }
    }, 3000)
    
    // Refresh entries when window regains focus
    const handleFocus = () => {
      fetchEntries()
    }
    
    // Listen for storage changes (between tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dictionary_notebook_entries') {
        fetchEntries()
      }
    }
    
    // Listen for custom event when entry is saved (same tab)
    const handleNotebookUpdate = () => {
      fetchEntries()
    }
    
    // Listen for definition updates from lookup page
    const handleDefinitionUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent
      const { word, targetLanguage, nativeLanguage, result } = customEvent.detail
      // Find matching entry and update it
      const currentEntries = await getNotebookEntries()
      const matchingEntry = currentEntries.find(
        (e: NotebookEntry) => e.word === word && 
        e.targetLanguage === targetLanguage && 
        e.nativeLanguage === nativeLanguage
      )
      
      if (matchingEntry) {
        try {
          // Update the notebook entry with new definition
          await saveNotebookEntry({
            word: result.word,
            phonetic: result.phonetic || undefined,
            targetLanguage: result.targetLanguage || targetLanguage,
            nativeLanguage: result.nativeLanguage || nativeLanguage,
            definition: result.definition,
            definitionTarget: result.definitionTarget || '',
            imageUrl: result.imageUrl || undefined,
            audioUrl: result.audioUrl || undefined,
            exampleSentence1: result.examples[0]?.sentence || '',
            exampleSentence2: result.examples[1]?.sentence || '',
            exampleTranslation1: result.examples[0]?.translation || '',
            exampleTranslation2: result.examples[1]?.translation || '',
            usageNote: result.usageNote || '',
            tags: matchingEntry.tags || [],
          }, true) // Replace existing
          
          // Refresh entries
          fetchEntries()
        } catch (error) {
          console.error('Error updating notebook entry:', error)
        }
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('notebookUpdated', handleNotebookUpdate)
      window.addEventListener('definitionUpdated', handleDefinitionUpdate)
    }
    
    return () => {
      clearTimeout(timeout)
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('notebookUpdated', handleNotebookUpdate)
        window.removeEventListener('definitionUpdated', handleDefinitionUpdate)
      }
    }
  }, [])

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; word: string } | null>(null)

  const handleDelete = async (id: string) => {
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    setDeleteConfirm({ id, word: entry.word })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    const { id } = deleteConfirm
    setDeleteConfirm(null)

    setDeletingId(id)
    try {
      await deleteNotebookEntry(id)
      setEntries(entries.filter(e => e.id !== id))
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (error) {
      console.error('Error deleting entry:', error)
      setMessage({ text: 'Failed to delete entry', type: 'error' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEntries.length) {
      // Deselect all
      setSelectedIds(new Set())
    } else {
      // Select all filtered entries
      setSelectedIds(new Set(filteredEntries.map(e => e.id)))
    }
  }

  const handleFormUpload = async () => {
    if (!formWords.trim()) {
      setMessage({ text: 'Please enter at least one word', type: 'info' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setIsUploading(true)
    setUploadProgress({ current: 0, total: 0 })

    try {
      // Split by newlines, commas, or spaces
      const words = formWords
        .split(/[\n,]+/)
        .map(w => w.trim())
        .filter(w => w.length > 0)

      if (words.length === 0) {
        setMessage({ text: 'No valid words found', type: 'info' })
        setTimeout(() => setMessage(null), 3000)
        setIsUploading(false)
        return
      }

      setUploadProgress({ current: 0, total: words.length })

      let successCount = 0
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        try {
          // Lookup each word
          const response = await fetch('/api/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              word,
              targetLanguage,
              nativeLanguage,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            // Save to notebook
            await saveNotebookEntry({
              word: data.word,
              phonetic: data.phonetic || undefined,
              targetLanguage,
              nativeLanguage,
              definition: data.definition || '',
              definitionTarget: data.definitionTarget || '',
              imageUrl: data.imageUrl || undefined,
              exampleSentence1: data.examples?.[0]?.sentence || '',
              exampleSentence2: data.examples?.[1]?.sentence || '',
              exampleTranslation1: data.examples?.[0]?.translation || '',
              exampleTranslation2: data.examples?.[1]?.translation || '',
              usageNote: data.usageNote || '',
            })
            successCount++
          }
        } catch (error) {
          console.error(`Failed to process word "${word}":`, error)
        }
        setUploadProgress({ current: i + 1, total: words.length })
      }

      setMessage({ text: `Upload complete! Success: ${successCount}/${words.length} words`, type: 'success' })
      setTimeout(() => setMessage(null), 3000)
      setFormWords('')
      setShowFormUpload(false)
      fetchEntries()
    } catch (error: any) {
      console.error('Form upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const handleBatchUpload = async (file: File) => {
    if (!file) return
    
    setIsUploading(true)
    setUploadProgress({ current: 0, total: 0 })
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetLanguage', targetLanguage)
      formData.append('nativeLanguage', nativeLanguage)
      
      const response = await fetch('/api/batch-upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const { results, summary } = await response.json()
      
      // Save successful results to notebook
      let savedCount = 0
      for (const result of results) {
        if (result.success && result.definition) {
          try {
            await saveNotebookEntry({
              word: result.word,
              targetLanguage,
              nativeLanguage,
              definition: result.definition.definition || '',
              definitionTarget: result.definition.definitionTarget || '',
              imageUrl: result.definition.imageUrl || undefined,
              exampleSentence1: result.definition.examples?.[0]?.sentence || '',
              exampleSentence2: result.definition.examples?.[1]?.sentence || '',
              exampleTranslation1: result.definition.examples?.[0]?.translation || '',
              exampleTranslation2: result.definition.examples?.[1]?.translation || '',
              usageNote: result.definition.usageNote || '',
            })
            savedCount++
          } catch (error) {
            console.error(`Failed to save word "${result.word}":`, error)
          }
        }
      }
      
        setMessage({ text: `Batch upload complete! Success: ${summary.success}/${summary.total}, Saved: ${savedCount} words`, type: 'success' })
        setTimeout(() => setMessage(null), 3000)
      fetchEntries()
      setShowBatchUpload(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Batch upload error:', error)
      setMessage({ text: `Upload failed: ${error.message}`, type: 'error' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setIsUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const handleBatchTag = async (tagToAdd?: string) => {
    if (selectedIds.size === 0) {
      // Enable selection mode
      setShowBatchTag(true)
      return
    }
    
    const tag = tagToAdd || newTag.trim()
    if (!tag) {
      setMessage({ text: 'Please enter a tag name or select an existing tag', type: 'info' })
      setTimeout(() => setMessage(null), 3000)
      return
    }
    
    const entryIds = Array.from(selectedIds)
    try {
      const count = await addTagsToEntries(entryIds, [tag])
      
      if (count > 0) {
        // Add to recent tags
        const recent = [...recentTags]
        if (!recent.includes(tag)) {
          recent.unshift(tag)
          if (recent.length > 10) recent.pop() // Keep only last 10
          setRecentTags(recent)
          localStorage.setItem('recentTags', JSON.stringify(recent))
        }
        
        setMessage({ text: `Added tag "${tag}" to ${count} entries`, type: 'success' })
        setTimeout(() => setMessage(null), 3000)
        setNewTag('')
        const tags = await getAllTags()
        setAvailableTags(tags)
        fetchEntries()
      }
    } catch (error) {
      console.error('Error adding tags:', error)
      setMessage({ text: 'Failed to add tags', type: 'error' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleRemoveBatchTag = async (tag: string) => {
    if (selectedIds.size === 0) {
      setMessage({ text: 'Please select at least one entry', type: 'info' })
      setTimeout(() => setMessage(null), 3000)
      return
    }
    
    const entryIds = Array.from(selectedIds)
    try {
      const count = await removeTagsFromEntries(entryIds, [tag])
      
      if (count > 0) {
        setMessage({ text: `Removed tag "${tag}" from ${count} entries`, type: 'success' })
        setTimeout(() => setMessage(null), 3000)
        const tags = await getAllTags()
        setAvailableTags(tags)
        fetchEntries()
      }
    } catch (error) {
      console.error('Error removing tags:', error)
      setMessage({ text: 'Failed to remove tags', type: 'error' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleGenerateStory = async () => {
    if (selectedIds.size === 0) {
      setMessage({ text: 'Please select at least one word to generate a story', type: 'info' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setIsGeneratingStory(true)
    try {
      const selectedEntries = filteredEntries.filter(e => selectedIds.has(e.id))
      
      if (selectedEntries.length === 0) {
        throw new Error('No entries selected')
      }

      const nativeLanguage = selectedEntries[0].nativeLanguage
      const targetLanguage = selectedEntries[0].targetLanguage

      const words = selectedEntries.map(entry => ({
        word: entry.word,
        definition: entry.definition,
        targetLanguage: entry.targetLanguage,
      }))

      // Call API route instead of importing generateStory directly
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words,
          nativeLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate story')
      }

      const storyResult = await response.json()

      const newStory = await saveStory({
        content: storyResult.story,
        translation: storyResult.translation,
        wordsUsed: Array.from(selectedIds),
      })

      setStory({
        id: newStory.id,
        content: newStory.content,
        translation: newStory.translation,
        wordsUsed: newStory.wordsUsed,
        createdAt: newStory.createdAt,
      })
    } catch (error) {
      console.error('Error generating story:', error)
      setMessage({ text: 'Failed to generate story', type: 'error' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsGeneratingStory(false)
    }
  }

          return (
            <main className="min-h-screen bg-white">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation */}
                <Navigation />

                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-5xl font-light text-gray-900 tracking-tight mb-2">My Notebook</h1>
                  <p className="text-gray-500 text-lg">Your saved words and definitions</p>
                </div>

                {/* Batch Actions - At the top */}
                {!isLoading && !error && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {/* Batch Upload Button */}
                    <button
                      onClick={() => {
                        setShowBatchUpload(!showBatchUpload)
                        setShowFormUpload(false)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      {showBatchUpload ? 'Hide Upload' : 'Batch Upload'}
                    </button>
                    
                    {/* Form Upload Button */}
                    <button
                      onClick={() => {
                        setShowFormUpload(!showFormUpload)
                        setShowBatchUpload(false)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      {showFormUpload ? 'Hide Form' : 'Form Upload'}
                    </button>

                    {/* Batch Tagging Button */}
                    {filteredEntries.length > 0 && (
                      <button
                        onClick={() => {
                          if (selectedIds.size === 0) {
                            // Enable selection mode
                            setShowBatchTag(true)
                          } else {
                            // Already have selection, toggle modal
                            setShowBatchTag(!showBatchTag)
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <Tag className="w-4 h-4" />
                        {showBatchTag ? 'Hide Tags' : 'Batch Tag'}
                      </button>
                    )}
                  </div>
                )}

                {/* Tag Filter - At the top */}
                {!isLoading && !error && entries.length > 0 && (
                  <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
                      <button
                        onClick={() => {
                          setSelectedTag(null)
                          setSelectedDateFilter(null)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          !selectedTag && !selectedDateFilter
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTag('last-3-days')
                          setSelectedDateFilter('last-3-days')
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedTag === 'last-3-days'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Last 3 Days
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTag('last-7-days')
                          setSelectedDateFilter('last-7-days')
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedTag === 'last-7-days'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Last 7 Days
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTag('last-30-days')
                          setSelectedDateFilter('last-30-days')
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedTag === 'last-30-days'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Last 30 Days
                      </button>
                    </div>
                    {availableTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                        {availableTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSelectedTag(tag)
                              setSelectedDateFilter(null)
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              selectedTag === tag && !selectedDateFilter
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedTag && (
                      <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredEntries.length} of {entries.length} entries
                      </div>
                    )}
                  </div>
                )}

        {/* Inline Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8">
            <p className="font-medium mb-1">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchEntries}
              className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Story Generation */}
        {filteredEntries.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-light text-gray-900 mb-1">
                  Generate Story
                </h2>
                <p className="text-sm text-gray-500">
                  Select words below and create a story to help memorize them
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  {selectedIds.size === filteredEntries.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory || selectedIds.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGeneratingStory ? 'Generating...' : 'Generate Story'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Story */}
        {story && filteredEntries.length > 0 && (
          <div className="mb-8">
            <StoryView story={story} targetLanguage={filteredEntries[0]?.targetLanguage || 'en'} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
            <p className="mt-4 text-gray-600 text-sm font-medium">Loading notebook...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && entries.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-xl font-light text-gray-900 mb-2">Your notebook is empty</p>
            <p className="text-gray-500 mb-8 text-sm">Save words from the main page to see them here</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Start Looking Up Words
            </Link>
          </div>
        )}

        {/* Entries List */}
        {!isLoading && !error && entries.length > 0 && (
          <div className="space-y-3">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="relative flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(entry.id)}
                  onChange={() => toggleSelection(entry.id)}
                  className="mt-5 w-5 h-5 text-gray-600 rounded focus:ring-gray-500 flex-shrink-0"
                />
                <div className={`flex-1 ${selectedIds.has(entry.id) ? 'opacity-60' : ''}`}>
                  <NotebookItem
                    entry={entry}
                    onDelete={() => handleDelete(entry.id)}
                    isDeleting={deletingId === entry.id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Form Upload Modal */}
        {showFormUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Form Upload</h2>
                <button
                  onClick={() => setShowFormUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Language
                    </label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Native Language
                    </label>
                    <select
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value as LanguageCode)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Words (one per line, or separated by commas)
                  </label>
                  <textarea
                    value={formWords}
                    onChange={(e) => setFormWords(e.target.value)}
                    placeholder="hello&#10;world&#10;bank&#10;study"
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formWords.split(/[\n,]+/).filter(w => w.trim()).length} word(s) detected
                  </p>
                </div>

                {isUploading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 mb-2">
                      Uploading: {uploadProgress.current} / {uploadProgress.total}
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleFormUpload}
                    disabled={isUploading || !formWords.trim()}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Words'}
                  </button>
                  <button
                    onClick={() => {
                      setShowFormUpload(false)
                      setFormWords('')
                    }}
                    disabled={isUploading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Upload Modal */}
        {showBatchUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Batch Upload</h2>
                <button
                  onClick={() => setShowBatchUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>📥 Download Template:</strong>
                  </p>
                  <a
                    href="/batch-upload-template.csv"
                    download
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Download CSV Template
                  </a>
                  <p className="text-xs text-blue-700 mt-2">
                    Format: word, target_language, native_language (one word per line)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Language
                    </label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Native Language
                    </label>
                    <select
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value as LanguageCode)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleBatchUpload(file)
                    }}
                    className="hidden"
                    id="batch-upload-file"
                  />
                  <label
                    htmlFor="batch-upload-file"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                  {isUploading && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      Processing... ({uploadProgress.current}/{uploadProgress.total})
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Supported: .txt, .md, .csv, .xlsx, .xls
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Tagging Modal */}
        {showBatchTag && entries.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Batch Tagging</h2>
                <button
                  onClick={() => {
                    setShowBatchTag(false)
                    if (selectedIds.size === 0) {
                      setSelectedIds(new Set())
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedIds.size === 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Select entries using checkboxes, then click "Batch Tag" again to tag them.
                    </p>
                    <button
                      onClick={() => setShowBatchTag(false)}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Got it, I'll select entries first
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 font-medium">
                      {selectedIds.size} entry(ies) selected
                    </p>
                    
                    {/* Recent Tags */}
                    {recentTags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Recent Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {recentTags.slice(0, 5).map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleBatchTag(tag)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Existing Tags */}
                    {availableTags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Existing Tags:</p>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {availableTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleBatchTag(tag)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add New Tag */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Create New Tag:</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleBatchTag()}
                          placeholder="Enter tag name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => handleBatchTag()}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Delete Entry"
          message={`Are you sure you want to delete "${deleteConfirm?.word}" from your notebook? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </main>
  )
}
