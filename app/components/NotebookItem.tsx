'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Trash2, Tag, X, MessageSquare, Save, ImageIcon, Loader2 } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import { addTagToEntry, removeTagFromEntry } from '@/app/lib/storage-supabase'
import { createClient } from '@/app/lib/supabase/client'
import type { NotebookEntry } from '@/app/lib/types'

interface NotebookItemProps {
  entry: NotebookEntry
  onDelete: () => void
  isDeleting?: boolean
}

export default function NotebookItem({ entry, onDelete, isDeleting = false }: NotebookItemProps) {
  const [imageError, setImageError] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>(entry.tags || [])
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [userComment, setUserComment] = useState('')
  const [isLoadingComment, setIsLoadingComment] = useState(false)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<NotebookEntry>(entry)
  const [displayedComment, setDisplayedComment] = useState<string>('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  // Sync tags when entry changes
  useEffect(() => {
    setTags(entry.tags || [])
    setCurrentEntry(entry)
  }, [entry.tags, entry.id])
  
  // Load user comment when entry changes
  useEffect(() => {
    loadUserComment()
    loadCommentForDisplay()
  }, [entry.id])
  
  const loadCommentForDisplay = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setDisplayedComment('')
        return
      }
      
      const { data, error } = await supabase
        .from('word_comments')
        .select('comment')
        .eq('word', entry.word)
        .eq('target_language', entry.targetLanguage)
        .eq('native_language', entry.nativeLanguage)
        .eq('user_id', user.id)
        .is('word_definition_id', null)
        .maybeSingle()
      
      if (!error && data?.comment) {
        setDisplayedComment(data.comment)
      } else {
        setDisplayedComment('')
      }
    } catch (error) {
      console.error('Error loading comment for display:', error)
      setDisplayedComment('')
    }
  }
  
  const loadUserComment = async () => {
    setIsLoadingComment(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoadingComment(false)
        return
      }
      
      // Look up comment by word, target_language, native_language (for notebook entries without word_definition_id)
      const { data, error } = await supabase
        .from('word_comments')
        .select('comment')
        .eq('word', entry.word)
        .eq('target_language', entry.targetLanguage)
        .eq('native_language', entry.nativeLanguage)
        .eq('user_id', user.id)
        .is('word_definition_id', null) // Only get comments without word_definition_id
        .maybeSingle()
      
      if (!error && data) {
        setUserComment(data.comment || '')
      } else {
        setUserComment('')
      }
    } catch (error) {
      console.error('Error loading comment:', error)
      setUserComment('')
    } finally {
      setIsLoadingComment(false)
    }
  }
  
  const handleSaveComment = async () => {
    setIsSavingComment(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Please log in to save comments')
        setTimeout(() => setMessage(null), 3000)
        return
      }
      
      // Use upsert with word, target_language, native_language (for notebook entries)
      // word_definition_id will be NULL for notebook entries
      // If comment is empty, delete the record instead
      if (!userComment.trim()) {
        const { error: deleteError } = await supabase
          .from('word_comments')
          .delete()
          .eq('word', entry.word)
          .eq('target_language', entry.targetLanguage)
          .eq('native_language', entry.nativeLanguage)
          .eq('user_id', user.id)
          .is('word_definition_id', null)
        
        if (deleteError) {
          console.error('Supabase delete error:', deleteError)
          throw deleteError
        }
        setDisplayedComment('')
      } else {
        // First try to find existing comment
        const { data: existing } = await supabase
          .from('word_comments')
          .select('id')
          .eq('word', entry.word)
          .eq('target_language', entry.targetLanguage)
          .eq('native_language', entry.nativeLanguage)
          .eq('user_id', user.id)
          .is('word_definition_id', null)
          .maybeSingle()
        
        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('word_comments')
            .update({
              comment: userComment.trim(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
          
          if (error) {
            console.error('Supabase update error:', error)
            throw error
          }
        } else {
          // Insert new
          const { error } = await supabase
            .from('word_comments')
            .insert({
              word: entry.word,
              target_language: entry.targetLanguage,
              native_language: entry.nativeLanguage,
              user_id: user.id,
              word_definition_id: null,
              comment: userComment.trim(),
              updated_at: new Date().toISOString(),
            })
          
          if (error) {
            // If it's a unique constraint error, try to update instead
            if (error.code === '23505') {
              const { error: updateError } = await supabase
                .from('word_comments')
                .update({
                  comment: userComment.trim(),
                  updated_at: new Date().toISOString(),
                })
                .eq('word', entry.word)
                .eq('target_language', entry.targetLanguage)
                .eq('native_language', entry.nativeLanguage)
                .eq('user_id', user.id)
                .is('word_definition_id', null)
              
              if (updateError) {
                console.error('Supabase update error after conflict:', updateError)
                throw updateError
              }
            } else {
              console.error('Supabase insert error:', error)
              throw error
            }
          }
        }
        setDisplayedComment(userComment.trim())
      }
      
      setShowCommentModal(false)
      window.dispatchEvent(new CustomEvent('notebookUpdated'))
    } catch (error) {
      console.error('Error saving comment:', error)
      setMessage('Failed to save comment. Please try again.')
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleAddTag = async () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const tag = newTag.trim()
      try {
        const success = await addTagToEntry(entry.id, tag)
        if (success) {
          // Update local state
          const updatedTags = [...tags, tag]
          setTags(updatedTags)
          // Update entry
          setCurrentEntry({ ...currentEntry, tags: updatedTags })
          setNewTag('')
          setShowTagInput(false)
          // Save to recent tags
          const recent = JSON.parse(localStorage.getItem('recentTags') || '[]')
          if (!recent.includes(tag)) {
            recent.unshift(tag)
            if (recent.length > 10) recent.pop()
            localStorage.setItem('recentTags', JSON.stringify(recent))
          }
          window.dispatchEvent(new CustomEvent('notebookUpdated'))
        }
      } catch (error) {
        console.error('Error adding tag:', error)
        setMessage('Failed to add tag. Please try again.')
        setTimeout(() => setMessage(null), 3000)
      }
    }
  }

  const handleRemoveTag = async (tag: string) => {
    try {
      const success = await removeTagFromEntry(entry.id, tag)
      if (success) {
        // Update local state
        const updatedTags = tags.filter(t => t !== tag)
        setTags(updatedTags)
        // Update entry
        setCurrentEntry({ ...currentEntry, tags: updatedTags })
        window.dispatchEvent(new CustomEvent('notebookUpdated'))
      }
    } catch (error) {
      console.error('Error removing tag:', error)
      setMessage('Failed to remove tag. Please try again.')
      setTimeout(() => setMessage(null), 3000)
    }
  }
  
  const handleGenerateImage = async () => {
    if (isGeneratingImage) return
    
    setIsGeneratingImage(true)
    
    try {
      const definition = currentEntry.definitionTarget || currentEntry.definition
      const meaningContext = currentEntry.definition
      
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: currentEntry.word,
          definition,
          meaningContext,
        }),
      })
      
      if (response.ok) {
        const { imageUrl } = await response.json()
        if (imageUrl) {
          // Update the entry with the new image URL
          setCurrentEntry({
            ...currentEntry,
            imageUrl,
          })
          
          // Also update the parent component's entry
          window.dispatchEvent(new CustomEvent('notebookUpdated'))
        }
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
      setMessage('Failed to generate image. Please try again.')
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all overflow-hidden"
    >
      {message && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {message}
        </div>
      )}
      {/* Compact Header - Always Visible */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-medium text-gray-900 truncate">
              {entry.word}
              {entry.meaningIndex && (
                <span className="ml-2 text-sm font-normal text-gray-500">(Meaning {entry.meaningIndex})</span>
              )}
            </h3>
            {(entry as any).phonetic && (
              <span className="text-base sm:text-lg text-gray-500 font-light">/{(entry as any).phonetic}/</span>
            )}
            <AudioPlayer text={entry.word} language={entry.targetLanguage} size="sm" />
          </div>
          
          {/* Definition - Always visible, fully shown (only when not expanded) */}
          {!isExpanded && (
            <div className="mb-2">
              {currentEntry.definitionTarget && currentEntry.definitionTarget.trim() ? (
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  {currentEntry.definitionTarget}
                </p>
              ) : (
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  {currentEntry.definition}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Add tag"
          >
            <Tag className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCommentModal(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Add your comment"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Delete entry"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded Content - Animated */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 space-y-4">
              {/* Image Generation Button */}
              {!currentEntry.imageUrl && (
                <div className="mb-4">
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    title="Generate image from LLM"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Image...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>Generate Image</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Image */}
              {currentEntry.imageUrl && currentEntry.imageUrl.trim() !== '' && !imageError && (
                <div className="w-full max-w-xs h-48 rounded-lg overflow-hidden bg-gray-50 relative group mb-4">
                  <Image
                    src={currentEntry.imageUrl}
                    alt={currentEntry.word}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                    unoptimized
                    onError={() => setImageError(true)}
                  />
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                    title="Regenerate image"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-gray-700" />
                    )}
                  </button>
                </div>
              )}

              {/* Full Definitions - Only show in expanded view */}
              <div className="space-y-3">
                {currentEntry.definitionTarget && currentEntry.definitionTarget.trim() && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Definition ({currentEntry.targetLanguage})
                    </h4>
                    <p className="text-gray-900 text-lg font-light leading-relaxed">
                      {currentEntry.definitionTarget}
                    </p>
                  </div>
                )}
                {currentEntry.definition && currentEntry.definition.trim() && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Translation
                    </h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {currentEntry.definition}
                    </p>
                  </div>
                )}
              </div>

              {/* Examples */}
              {(currentEntry.exampleSentence1 || currentEntry.exampleSentence2) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Examples
                  </h4>
                  {currentEntry.exampleSentence1 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-gray-900 font-light mb-1">{currentEntry.exampleSentence1}</p>
                      {currentEntry.exampleTranslation1 && (
                        <p className="text-gray-500 text-sm italic">{currentEntry.exampleTranslation1}</p>
                      )}
                    </div>
                  )}
                  {currentEntry.exampleSentence2 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-gray-900 font-light mb-1">{currentEntry.exampleSentence2}</p>
                      {currentEntry.exampleTranslation2 && (
                        <p className="text-gray-500 text-sm italic">{currentEntry.exampleTranslation2}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Usage Note */}
              {currentEntry.usageNote && currentEntry.usageNote.trim() && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Usage Note
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed italic">
                    {currentEntry.usageNote}
                  </p>
                </div>
              )}

              {/* User Comment */}
              {displayedComment && displayedComment.trim() && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Your Comment
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {displayedComment}
                  </p>
                </div>
              )}

              {/* Tags */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Tags
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {showTagInput ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        onBlur={() => {
                          if (!newTag.trim()) setShowTagInput(false)
                        }}
                        placeholder="Tag name"
                        className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-2.5 py-1 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowTagInput(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      Add Tag
                    </button>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                {currentEntry.firstLearnedDate && (
                  <p className="text-xs text-gray-400">
                    First learned: {new Date(currentEntry.firstLearnedDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Added: {new Date(currentEntry.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your Comment on &quot;{currentEntry.word}&quot;
              </h2>
              <button
                onClick={() => setShowCommentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {isLoadingComment ? (
                <p className="text-gray-500">Loading comment...</p>
              ) : (
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Add your personal notes, thoughts, or examples about this word..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none resize-none min-h-[200px] text-gray-900 bg-white"
                  rows={8}
                />
              )}
              <p className="mt-2 text-sm text-gray-500">
                Your comment is private and only visible to you.
              </p>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComment}
                disabled={isSavingComment || isLoadingComment}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingComment ? 'Saving...' : 'Save Comment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
