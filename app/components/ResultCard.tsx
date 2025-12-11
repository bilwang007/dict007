'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Loader2, Check, Sparkles, MessageSquare, X, Save, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import AudioPlayer from './AudioPlayer'
import { createClient } from '@/app/lib/supabase/client'
import type { LookupResult, LanguageCode } from '@/app/lib/types'

// Component to format definitions with multiple meanings
function FormattedDefinition({ text, className = 'text-lg sm:text-xl text-gray-900 font-light leading-relaxed' }: { text: string; className?: string }) {
  // Check if text contains numbered list (1. 2. etc.) or bullet points
  const hasNumberedList = /^\d+\.\s/.test(text.trim()) || /\n\d+\.\s/.test(text)
  const hasBulletPoints = /^[\*\-•]\s/.test(text.trim()) || /\n[\*\-•]\s/.test(text)
  
  if (hasNumberedList || hasBulletPoints) {
    // Split by lines and format as list
    const lines = text.split('\n').filter(line => line.trim())
    const items = lines.map(line => {
      // Remove leading numbers/bullets and clean up
      const cleaned = line.replace(/^[\d\*\-•\.\s]+/, '').trim()
      return cleaned
    }).filter(item => item.length > 0)
    
    if (items.length > 1) {
      return (
        <ol className={`${className} list-decimal list-inside space-y-2`}>
          {items.map((item, index) => (
            <li key={index} className="pl-2">{item}</li>
          ))}
        </ol>
      )
    }
  }
  
  // Check for patterns like "1. [meaning] 2. [meaning]" in single line
  const numberedPattern = /(\d+\.\s[^0-9]+?)(?=\s\d+\.|$)/g
  const matches = text.match(numberedPattern)
  
  if (matches && matches.length > 1) {
    return (
      <ol className={`${className} list-decimal list-inside space-y-2`}>
        {matches.map((match, index) => {
          const cleaned = match.replace(/^\d+\.\s/, '').trim()
          return (
            <li key={index} className="pl-2">{cleaned}</li>
          )
        })}
      </ol>
    )
  }
  
  // Default: show as paragraph
  return <p className={className}>{text}</p>
}

interface ResultCardProps {
  result: LookupResult
  targetLanguage: LanguageCode
  nativeLanguage: LanguageCode
  onSaveToNotebook: () => void
  isSaving?: boolean
  isSaved?: boolean
}

export default function ResultCard({
  result,
  targetLanguage,
  nativeLanguage,
  onSaveToNotebook,
  isSaving = false,
  isSaved = false,
}: ResultCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [userComment, setUserComment] = useState('')
  const [isLoadingComment, setIsLoadingComment] = useState(false)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null)
  const [currentResult, setCurrentResult] = useState(result)
  
  // Update current result when result prop changes
  const loadUserComment = useCallback(async (): Promise<void> => {
    if (!result?.wordDefinitionId) return
    
    setIsLoadingComment(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoadingComment(false)
        return
      }
      
      const { data, error } = await supabase
        .from('word_comments')
        .select('comment')
        .eq('word_definition_id', result.wordDefinitionId)
        .eq('user_id', user.id)
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
  }, [result?.wordDefinitionId])

  // Sync currentResult when result prop changes
  useEffect(() => {
    setCurrentResult(result)
  }, [result])

  // Load user comment when result changes
  useEffect(() => {
    if (result?.wordDefinitionId) {
      loadUserComment()
    } else {
      setUserComment('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.wordDefinitionId])
  
  const handleGenerateImage = async (meaningIndex?: number) => {
    if (isGeneratingImage) return
    
    setIsGeneratingImage(true)
    setGeneratingImageIndex(meaningIndex ?? null)
    
    try {
      const definition = meaningIndex !== undefined && currentResult.meanings
        ? currentResult.meanings[meaningIndex].definitionTarget
        : currentResult.definitionTarget || currentResult.definition
      
      const meaningContext = meaningIndex !== undefined && currentResult.meanings
        ? currentResult.meanings[meaningIndex].definition
        : undefined
      
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: currentResult.word,
          definition,
          meaningContext,
        }),
      })
      
      if (response.ok) {
        const { imageUrl } = await response.json()
        if (imageUrl) {
          // Update the result with the new image URL
          if (meaningIndex !== undefined && currentResult.meanings) {
            // Update specific meaning's image
            const updatedMeanings = [...currentResult.meanings]
            updatedMeanings[meaningIndex] = {
              ...updatedMeanings[meaningIndex],
              imageUrl,
            }
            setCurrentResult({
              ...currentResult,
              meanings: updatedMeanings,
              imageUrl: meaningIndex === 0 ? imageUrl : currentResult.imageUrl, // Update main image if first meaning
            })
          } else {
            // Update main image
            setCurrentResult({
              ...currentResult,
              imageUrl,
            })
          }
          
          // Also update the parent component's result
          window.dispatchEvent(new CustomEvent('imageGenerated', {
            detail: { word: currentResult.word, imageUrl, meaningIndex }
          }))
        }
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGeneratingImage(false)
      setGeneratingImageIndex(null)
    }
  }
  
  const handleSaveComment = async () => {
    if (!result?.wordDefinitionId) return
    
    setIsSavingComment(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('Please log in to save comments')
        return
      }
      
      // If comment is empty, delete the record instead
      if (!userComment.trim()) {
        const { error: deleteError } = await supabase
          .from('word_comments')
          .delete()
          .eq('word_definition_id', result.wordDefinitionId)
          .eq('user_id', user.id)
        
        if (deleteError) {
          console.error('Supabase delete error:', deleteError)
          throw deleteError
        }
      } else {
        // First try to find existing comment
        const { data: existing } = await supabase
          .from('word_comments')
          .select('id')
          .eq('word_definition_id', result.wordDefinitionId)
          .eq('user_id', user.id)
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
              word_definition_id: result.wordDefinitionId,
              user_id: user.id,
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
                .eq('word_definition_id', result.wordDefinitionId)
                .eq('user_id', user.id)
              
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
      }
      
      setShowCommentModal(false)
    } catch (error) {
      console.error('Error saving comment:', error)
      console.error('Failed to save comment:', error)
    } finally {
      setIsSavingComment(false)
    }
  }
  
  const handleRegenerateWithAI = async () => {
    if (isRegenerating) return
    
    setIsRegenerating(true)
    try {
      // Call lookup API with forceAI flag to bypass database and skip image/audio generation for speed
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: result.word,
          targetLanguage,
          nativeLanguage,
          forceAI: true, // Force AI generation, skip database
          skipImage: true, // Skip image generation for faster response
          skipAudio: true, // Skip audio generation for faster response
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', errorText)
        throw new Error('Failed to regenerate definition')
      }
      
      const newResult = await response.json()
      
      // Keep the existing image and audio if available
      if (result.imageUrl && !newResult.imageUrl) {
        newResult.imageUrl = result.imageUrl
      }
      if (result.audioUrl && !newResult.audioUrl) {
        newResult.audioUrl = result.audioUrl
      }
      
      // Update the result by dispatching a custom event
      window.dispatchEvent(new CustomEvent('definitionRegenerated', { detail: newResult }))
    } catch (error) {
      console.error('Error regenerating definition:', error)
      console.error('Failed to regenerate definition:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Word Validity Notice */}
      {result.isValidWord === false && (
        <div className="mb-4 sm:mb-6 bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">Friendly Notice</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                &quot;{result.word}&quot; doesn&apos;t appear to be a recognized word in {targetLanguage === 'en' ? 'English' : targetLanguage}. 
                {result.suggestedWord ? (
                  <> Did you mean <span className="font-semibold">&quot;{result.suggestedWord}&quot;</span>? You can search for it if you&apos;d like!</>
                ) : (
                  <> We&apos;ve provided a definition based on what it could mean, but it might not be a standard word.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with word, phonetic, and audio */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-baseline gap-3 sm:gap-4 flex-1 min-w-0 flex-wrap">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 truncate">{result.word}</h1>
          {result.phonetic && (
            <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 font-light">/{result.phonetic}/</span>
          )}
          <AudioPlayer text={result.word} language={targetLanguage} size="lg" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {result.source === 'database' && (
            <button
              onClick={handleRegenerateWithAI}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors active:scale-[0.98] text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Regenerate definition with AI (more comprehensive)"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Regenerating...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Regenerate with AI</span>
                  <span className="sm:hidden">AI</span>
                </>
              )}
            </button>
          )}
          {result.wordDefinitionId && (
            <button
              onClick={() => setShowCommentModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors active:scale-[0.98] text-sm sm:text-base font-medium"
              title="Add your comment about this word"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Comment</span>
            </button>
          )}
        {/* Only show save button if word is not from database, or if it's from database but not yet saved to notebook */}
        {result.source !== 'database' || !isSaved ? (
          <button
            onClick={onSaveToNotebook}
            disabled={isSaving || isSaved}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-white rounded-lg transition-colors disabled:cursor-not-allowed active:scale-[0.98] text-sm sm:text-base font-medium shrink-0 ${
              isSaved
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-900 hover:bg-gray-800'
            } ${isSaving ? 'opacity-50' : ''}`}
            title={isSaved ? 'Already saved to notebook' : 'Click to save or press Enter'}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Saved to Notebook</span>
                <span className="sm:hidden">Saved</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Save to Notebook</span>
                <span className="sm:hidden">Save</span>
                <span className="hidden lg:inline text-xs opacity-75 ml-1">(Enter)</span>
              </>
            )}
          </button>
        ) : null}
        </div>
      </div>

      {/* Image Generation Button and Main Image - Only show if single meaning */}
      {(!currentResult.meanings || currentResult.meanings.length <= 1) && (
        <>
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            {!currentResult.imageUrl && (
              <button
                onClick={() => handleGenerateImage()}
                disabled={isGeneratingImage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Generate image from LLM"
              >
                {isGeneratingImage && generatingImageIndex === null ? (
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
            )}
          </div>

          {/* Main Image - Only for single meaning */}
          {currentResult.imageUrl && !imageError && (
            <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 relative group">
          <Image
                src={currentResult.imageUrl}
                alt={`Visualization of ${currentResult.word}`}
            width={800}
            height={400}
            className="w-full h-auto"
            unoptimized
            onError={() => setImageError(true)}
          />
              <button
                onClick={() => handleGenerateImage()}
                disabled={isGeneratingImage}
                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white border border-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                title="Regenerate image"
              >
                {isGeneratingImage && generatingImageIndex === null ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-gray-700" />
                )}
              </button>
        </div>
          )}
        </>
      )}

      {/* Definition - Show multiple meanings if available */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-light text-gray-900 mb-2 sm:mb-3">Definition</h2>
        
        {/* If multiple meanings, show each separately */}
        {currentResult.meanings && currentResult.meanings.length > 1 ? (
          <div className="space-y-6">
            {currentResult.meanings.map((meaning, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Meaning {meaning.meaningIndex}
                  </h3>
                  <button
                    onClick={() => handleGenerateImage(index)}
                    disabled={isGeneratingImage}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate image for this meaning"
                  >
                    {isGeneratingImage && generatingImageIndex === index ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3" />
                        <span>Generate Image</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Meaning Image */}
                {meaning.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={meaning.imageUrl}
                      alt={`Visualization of ${currentResult.word} - Meaning ${meaning.meaningIndex}`}
                      width={600}
                      height={300}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                )}
                
                {/* Target Language Definition */}
                <div className="mb-2">
                  <FormattedDefinition text={meaning.definitionTarget} />
                </div>
                
                {/* Native Language Definition/Translation */}
                {meaning.definition && meaning.definition.trim() && (
                  <div className="mt-2">
                    <FormattedDefinition text={meaning.definition} className="text-base sm:text-lg text-gray-700" />
                  </div>
                )}
                
                {/* Examples for this meaning */}
                {meaning.examples && meaning.examples.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {meaning.examples.map((example, exIndex) => (
                      <div key={exIndex} className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                        <p className="text-base text-gray-900 font-light">{example.sentence}</p>
                        <p className="text-sm text-gray-600 italic mt-1">{example.translation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Single meaning - show as before */}
            {currentResult.definitionTarget && currentResult.definitionTarget.trim() ? (
          <div className="mb-3">
                <FormattedDefinition text={currentResult.definitionTarget} />
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-lg sm:text-xl text-gray-500 italic">Definition in {targetLanguage} not available</p>
          </div>
        )}
        {/* Native Language Definition/Translation */}
            {currentResult.definition && currentResult.definition.trim() && (
          <div className="mt-2">
                <FormattedDefinition text={currentResult.definition} className="text-base sm:text-lg text-gray-700" />
          </div>
            )}
          </>
        )}
      </div>

      {/* Example Sentences - Only show if not showing per-meaning examples */}
      {(!currentResult.meanings || currentResult.meanings.length <= 1) && (
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-light text-gray-900 mb-2 sm:mb-3">Examples</h2>
          {currentResult.examples.map((example, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-xl"
          >
            <div className="flex items-start gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <p className="text-base sm:text-lg text-gray-900 flex-1 font-light">{example.sentence}</p>
              <AudioPlayer text={example.sentence} language={targetLanguage} size="md" />
            </div>
            <p className="text-sm sm:text-base text-gray-600 italic ml-0 sm:ml-4">{example.translation}</p>
          </div>
        ))}
      </div>
      )}

      {/* Usage Note */}
      <div className="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-xl">
        <h2 className="text-lg sm:text-xl font-light text-gray-900 mb-2">Usage Note</h2>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{result.usageNote}</p>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your Comment on &quot;{result.word}&quot;
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
    </div>
  )
}
