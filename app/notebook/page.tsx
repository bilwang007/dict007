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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [story, setStory] = useState<Story | null>(null)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [showBatchUpload, setShowBatchUpload] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [showBatchTag, setShowBatchTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('en')
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('zh')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      alert('Failed to delete entry')
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
    if (selectedIds.size === entries.length) {
      // Deselect all
      setSelectedIds(new Set())
    } else {
      // Select all
      setSelectedIds(new Set(entries.map(e => e.id)))
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
      
      alert(`Batch upload complete!\nSuccess: ${summary.success}/${summary.total}\nSaved: ${savedCount} words`)
      fetchEntries()
      setShowBatchUpload(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Batch upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const handleBatchTag = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one entry to tag')
      return
    }
    
    if (!newTag.trim()) {
      alert('Please enter a tag name')
      return
    }
    
    const tag = newTag.trim()
    const entryIds = Array.from(selectedIds)
    try {
      const count = await addTagsToEntries(entryIds, [tag])
      
      if (count > 0) {
        alert(`Added tag "${tag}" to ${count} entries`)
        setNewTag('')
        const tags = await getAllTags()
        setAvailableTags(tags)
        fetchEntries()
      }
    } catch (error) {
      console.error('Error adding tags:', error)
      alert('Failed to add tags')
    }
  }

  const handleRemoveBatchTag = async (tag: string) => {
    if (selectedIds.size === 0) {
      alert('Please select at least one entry')
      return
    }
    
    const entryIds = Array.from(selectedIds)
    try {
      const count = await removeTagsFromEntries(entryIds, [tag])
      
      if (count > 0) {
        alert(`Removed tag "${tag}" from ${count} entries`)
        const tags = await getAllTags()
        setAvailableTags(tags)
        fetchEntries()
      }
    } catch (error) {
      console.error('Error removing tags:', error)
      alert('Failed to remove tags')
    }
  }

  const handleGenerateStory = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one word to generate a story')
      return
    }

    setIsGeneratingStory(true)
    try {
      const selectedEntries = entries.filter(e => selectedIds.has(e.id))
      
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
      alert('Failed to generate story')
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
                <div className="mb-12">
                  <h1 className="text-5xl font-light text-gray-900 tracking-tight mb-2">My Notebook</h1>
                  <p className="text-gray-500 text-lg">Your saved words and definitions</p>
                </div>

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
        {entries.length > 0 && (
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
                  {selectedIds.size === entries.length ? 'Deselect All' : 'Select All'}
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
        {story && entries.length > 0 && (
          <div className="mb-8">
            <StoryView story={story} targetLanguage={entries[0]?.targetLanguage || 'en'} />
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
            {entries.map(entry => (
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

        {/* Batch Actions - Small buttons at bottom */}
        {!isLoading && !error && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-2 justify-center">
            {/* Batch Upload Button */}
            <button
              onClick={() => setShowBatchUpload(!showBatchUpload)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              {showBatchUpload ? 'Hide Upload' : 'Batch Upload'}
            </button>

            {/* Batch Tagging Button */}
            {entries.length > 0 && (
              <button
                onClick={() => setShowBatchTag(!showBatchTag)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Tag className="w-4 h-4" />
                {showBatchTag ? 'Hide Tags' : 'Batch Tag'}
              </button>
            )}
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
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Batch Tagging</h2>
                <button
                  onClick={() => setShowBatchTag(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {selectedIds.size > 0 
                    ? `${selectedIds.size} entry(ies) selected` 
                    : 'Select entries to tag them'}
                </p>
                
                {/* Add Tag */}
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
                    onClick={handleBatchTag}
                    disabled={selectedIds.size === 0 || !newTag.trim()}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
                
                {/* Available Tags */}
                {availableTags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {tag}
                          {selectedIds.size > 0 && (
                            <button
                              onClick={() => handleRemoveBatchTag(tag)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
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
