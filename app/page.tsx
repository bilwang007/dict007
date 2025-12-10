'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Sparkles } from 'lucide-react'
import Navigation from './components/Navigation'
import LookupForm from './components/LookupForm'
import ResultCard from './components/ResultCard'
import { DefinitionLoadingCard } from './components/TypingAnimation'
import LearningAnalysis from './components/LearningAnalysis'
import { saveNotebookEntry, isNotebookEntrySaved } from './lib/storage-supabase'
import { LANGUAGES, type LookupResult, type LanguageCode } from './lib/types'

export default function Home() {
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('zh')
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('en')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<LookupResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [isSaved, setIsSaved] = useState(false)
  const [loadingWord, setLoadingWord] = useState<string>('')
  const [loadingResult, setLoadingResult] = useState<Partial<LookupResult> | null>(null)
  const [minLoadingTime, setMinLoadingTime] = useState(false) // For database lookups
  const [lastSearchedWords, setLastSearchedWords] = useState<string[]>([])

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      setResult(null)
      setError(null)
      setIsLoading(false)
      setLoadingResult(null)
      setInput('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('resetLookupPage', handleReset)
    return () => window.removeEventListener('resetLookupPage', handleReset)
  }, [])
  
  const [regeneratedResult, setRegeneratedResult] = useState<LookupResult | null>(null)
  const [showSaveRegeneratedPrompt, setShowSaveRegeneratedPrompt] = useState(false)
  
  // Listen for definition regeneration event
  useEffect(() => {
    const handleRegeneration = (event: CustomEvent) => {
      const newResult = event.detail
      setRegeneratedResult(newResult)
      setShowSaveRegeneratedPrompt(true)
      // Image generation removed - user must click button manually
    }
    window.addEventListener('definitionRegenerated', handleRegeneration as EventListener)
    return () => window.removeEventListener('definitionRegenerated', handleRegeneration as EventListener)
  }, [])
  
  const handleAcceptRegenerated = () => {
    if (regeneratedResult) {
      setResult(regeneratedResult)
      setShowSaveRegeneratedPrompt(false)
      setRegeneratedResult(null)
      // Notify notebook to update if this word exists there
      window.dispatchEvent(new CustomEvent('definitionUpdated', { 
        detail: { 
          word: regeneratedResult.word,
          targetLanguage: regeneratedResult.targetLanguage || targetLanguage,
          nativeLanguage: regeneratedResult.nativeLanguage || nativeLanguage,
          result: regeneratedResult
        } 
      }))
    }
  }
  
  const handleRejectRegenerated = () => {
    setShowSaveRegeneratedPrompt(false)
    setRegeneratedResult(null)
  }

  // Check if word is already saved when result changes
  useEffect(() => {
    if (result) {
      isNotebookEntrySaved(result.word, targetLanguage, nativeLanguage)
        .then(saved => {
          setIsSaved(saved)
          setSaveStatus(saved ? 'saved' : 'idle')
        })
        .catch(() => {
          // If not authenticated or error, assume not saved
          setIsSaved(false)
          setSaveStatus('idle')
        })
      // Scroll to definition result when it appears
      setTimeout(() => {
        const element = document.getElementById('definition-result')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      setIsSaved(false)
      setSaveStatus('idle')
    }
  }, [result, targetLanguage, nativeLanguage])

  const handleLookup = async (word: string) => {
    setInput(word)
    setIsLoading(true)
    setError(null)
    setResult(null)
    setIsSaved(false)
    setSaveStatus('idle')
    setLoadingWord(word)
    setLoadingResult(null)
    setMinLoadingTime(false)

    const startTime = Date.now()
    // Consistent minimum loading time for smooth animation (like LLM generation)
    const MIN_LOADING_DURATION = 2000 // 2 seconds minimum for consistent animation

    // Check cache first
    const cacheKey = `lookup_${word}_${targetLanguage}_${nativeLanguage}`
    const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null
    if (cached) {
      try {
        const cachedData = JSON.parse(cached)
        // Check if cache is less than 24 hours old
        if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
          // Save the searched word (keep last 3)
          setLastSearchedWords(prev => {
            const filtered = prev.filter(w => w !== word) // Remove if already exists
            return [word, ...filtered].slice(0, 3) // Add to front, keep max 3
          })
          // Show consistent typing animation for cached results
          setLoadingResult(cachedData.data)
          setMinLoadingTime(true)
          const elapsed = Date.now() - startTime
          const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsed)
          
          setTimeout(() => {
          setResult(cachedData.data)
          setIsLoading(false)
            setLoadingResult(null)
            setMinLoadingTime(false)
          }, remainingTime)
          return
        }
      } catch (e) {
        // Cache invalid, continue with API call
      }
    }

    try {
      // Show loading state immediately
      setLoadingResult({ word, definitionTarget: '', definition: '', examples: [], usageNote: '' })
      setMinLoadingTime(true)
      
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          targetLanguage,
          nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to lookup word')
      }

      const data = await response.json()
      
      // Save the searched word (keep last 3)
      setLastSearchedWords(prev => {
        const filtered = prev.filter(w => w !== word) // Remove if already exists
        return [word, ...filtered].slice(0, 3) // Add to front, keep max 3
      })
      
      // Step-by-step display: Show definition first, then examples, then usage note
      // This makes lookup feel faster even if total time is the same
      if (data.definitionTarget || data.definition) {
        // Show definition immediately
        setLoadingResult({
          word: data.word,
          definitionTarget: data.definitionTarget || '',
          definition: data.definition || '',
          examples: [],
          usageNote: '',
          source: data.source,
        })
        
        // Show examples after 400ms
        setTimeout(() => {
          setLoadingResult(prev => prev ? {
            ...prev,
            examples: data.examples || [],
          } : null)
        }, 400)
        
        // Show usage note after 800ms
        setTimeout(() => {
          setLoadingResult(prev => prev ? {
            ...prev,
            usageNote: data.usageNote || '',
          } : null)
          
          // Final result after all parts shown
          setTimeout(() => {
            setResult(data)
            setIsLoading(false)
            setLoadingResult(null)
            setMinLoadingTime(false)
          }, 400)
        }, 800)
      } else {
        // Fallback: show all at once if no definition
        setLoadingResult(data)
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsed)
        
        setTimeout(() => {
          setResult(data)
          setIsLoading(false)
          setLoadingResult(null)
          setMinLoadingTime(false)
        }, remainingTime)
      }
      
      // Cache the result
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now(),
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup word')
      setIsLoading(false)
      setLoadingResult(null)
      setMinLoadingTime(false)
    }
  }

  const loadImageAsync = useCallback(async (word: string, definition: string) => {
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, definition }),
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        if (imageUrl) {
          // Update result with image URL if it matches current word
          setResult(prev => {
            if (prev && prev.word === word) {
              return { ...prev, imageUrl }
            }
            return prev
          })
        }
      }
    } catch (error) {
      console.error('Failed to load image:', error)
      // Continue without image
    }
  }, [])

  const handleSaveToNotebook = useCallback(() => {
    if (!result) return

    setIsSaving(true)
    setSaveStatus('idle')
    try {
      // If multiple meanings exist, save each one separately
      if (result.meanings && result.meanings.length > 1) {
        let savedCount = 0
        result.meanings.forEach((meaning, index) => {
          try {
            const savedEntry = saveNotebookEntry({
              word: result.word,
              phonetic: result.phonetic || undefined,
              targetLanguage,
              nativeLanguage,
              definition: meaning.definition,
              definitionTarget: meaning.definitionTarget,
              meaningIndex: meaning.meaningIndex, // Store meaning index
              imageUrl: meaning.imageUrl || undefined,
              audioUrl: undefined, // Audio generated on-demand
              exampleSentence1: meaning.examples[0]?.sentence || '',
              exampleSentence2: meaning.examples[1]?.sentence || '',
              exampleTranslation1: meaning.examples[0]?.translation || '',
              exampleTranslation2: meaning.examples[1]?.translation || '',
              usageNote: result.usageNote,
            } as any, true) // Always replace if exists
            savedCount++
            console.log(`Entry saved for meaning ${meaning.meaningIndex}:`, savedEntry)
          } catch (err) {
            console.error(`Error saving meaning ${meaning.meaningIndex}:`, err)
          }
        })
        
        if (savedCount > 0) {
          // Trigger custom event so notebook page can refresh if open
          window.dispatchEvent(new CustomEvent('notebookUpdated'))
          
          setSaveStatus('saved')
          setIsSaved(true)
          // Auto-hide notification after 3 seconds
          setTimeout(() => setSaveStatus('idle'), 3000)
        } else {
          throw new Error('Failed to save any meanings')
        }
      } else {
        // Single meaning - save as before
      const savedEntry = saveNotebookEntry({
        word: result.word,
        phonetic: result.phonetic || undefined,
        targetLanguage,
        nativeLanguage,
        definition: result.definition,
        definitionTarget: result.definitionTarget || '',
        imageUrl: result.imageUrl || undefined,
        audioUrl: undefined, // Audio generated on-demand
        exampleSentence1: result.examples[0]?.sentence || '',
        exampleSentence2: result.examples[1]?.sentence || '',
        exampleTranslation1: result.examples[0]?.translation || '',
        exampleTranslation2: result.examples[1]?.translation || '',
        usageNote: result.usageNote,
      } as any, true) // Always replace if exists
      
      console.log('Entry saved:', savedEntry)
      
      // Trigger custom event so notebook page can refresh if open
      window.dispatchEvent(new CustomEvent('notebookUpdated'))
      
      setSaveStatus('saved')
      setIsSaved(true)
      // Auto-hide notification after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (err) {
      console.error('Error saving to notebook:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }, [result, targetLanguage, nativeLanguage])

  // Handle Enter key to save or replace
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || 
          (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'Enter' && result && !isLoading && !isSaving && !isSaved) {
        e.preventDefault()
        handleSaveToNotebook()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [result, isLoading, isSaving, isSaved, handleSaveToNotebook])

  // Language selector component (reusable)
  const LanguageSelector = () => (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Learning Language
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none bg-white text-gray-900 text-sm sm:text-base font-medium"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Native Language Selector - Collapsible */}
      <details className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 mb-2">
          Your Language (for translations)
        </summary>
        <select
          value={nativeLanguage}
          onChange={(e) => setNativeLanguage(e.target.value as LanguageCode)}
          className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-green-400 focus:outline-none bg-gray-50 text-gray-700"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </details>
    </div>
  )

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col">
        {/* Navigation */}
        <Navigation />

        {/* Results - Show immediately after navigation when available */}
        {result && !isLoading && (
          <div id="definition-result" className="mt-4 sm:mt-6 animate-fade-in flex-shrink-0">
            {/* Save Status Notification */}
            {saveStatus === 'saved' && result?.source !== 'database' && (
              <div className="mb-4 bg-gray-50 border border-gray-200 text-gray-700 p-3 sm:p-4 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-900" />
                  <span className="font-medium text-sm">Saved to notebook!</span>
                </div>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 sm:p-4 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">Failed to save. Please try again.</span>
                </div>
              </div>
            )}
            {/* Regenerated Definition Prompt */}
            {showSaveRegeneratedPrompt && regeneratedResult && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-900 p-4 sm:p-5 rounded-xl animate-fade-in">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium text-sm">Definition regenerated with AI. Update the displayed definition?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAcceptRegenerated}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Yes, Update
                    </button>
                    <button
                      onClick={handleRejectRegenerated}
                      className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      No, Keep Original
                    </button>
                  </div>
                </div>
              </div>
            )}
            <ResultCard
              result={result}
              targetLanguage={targetLanguage}
              nativeLanguage={nativeLanguage}
              onSaveToNotebook={handleSaveToNotebook}
              isSaving={isSaving}
              isSaved={isSaved}
            />
          </div>
        )}

        {/* Lookup Form - Always visible, compact when result exists */}
        <div className={`${result ? 'mt-6 mb-4' : 'mt-6 sm:mt-10 lg:mt-12 mb-6 sm:mb-8'}`}>
          {result ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Look up another word:</p>
              <LookupForm onLookup={handleLookup} isLoading={isLoading} />
            </div>
          ) : (
            <>
              {/* Header - Centered */}
              <header className="text-center mb-6 sm:mb-10 lg:mb-12">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 tracking-tight mb-3">
                  AI Dictionary
                </h1>
                <p className="text-sm sm:text-base text-gray-500 px-2">
                  Learn languages with AI-powered definitions, images, and audio
                </p>
              </header>

              {/* Lookup Form - Centered */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl">
                <LookupForm onLookup={handleLookup} isLoading={isLoading} />
                </div>
                
                {/* Show last searched words below search bar */}
                {lastSearchedWords.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">Last searched:</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {lastSearchedWords.map((searchedWord, index) => (
                        <button
                          key={`${searchedWord}-${index}`}
                          onClick={() => handleLookup(searchedWord)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm font-medium border border-gray-200"
                        >
                          <span>{searchedWord}</span>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Learning Analysis - Below lookup form (only when no result and not loading) */}
              {!result && !isLoading && (
                <div className="w-full max-w-4xl mx-auto mt-8">
                  <LearningAnalysis />
                </div>
              )}
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 sm:p-5 rounded-xl mb-6 sm:mb-8 max-w-3xl mx-auto">
            <p className="font-medium text-sm sm:text-base mb-1">Error</p>
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Loading State with Typing Animation */}
        {isLoading && loadingResult && (
          <div className="mt-4 sm:mt-6 animate-fade-in">
            <DefinitionLoadingCard
              word={loadingWord}
              definition={loadingResult.definition}
              definitionTarget={loadingResult.definitionTarget}
              examples={loadingResult.examples}
              usageNote={loadingResult.usageNote}
              source={loadingResult.source}
              isLoadingExamples={!loadingResult.examples || loadingResult.examples.length === 0}
            />
          </div>
        )}
        
        {/* Fallback Loading State (when result not yet available) - Smooth like LLM chat */}
        {isLoading && !loadingResult && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Looking up word...</p>
            </div>
          </div>
        )}

        {/* Language Selector - Always at bottom */}
        <div className="mt-auto pt-6 sm:pt-8">
          <LanguageSelector />
        </div>
      </div>
    </main>
  )
}
