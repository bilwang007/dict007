'use client'

import { useState, useEffect } from 'react'

interface TypingAnimationProps {
  text: string
  speed?: number // Characters per second
  onComplete?: () => void
  className?: string
  showCursor?: boolean
}

export default function TypingAnimation({
  text,
  speed = 30, // Default: 30 characters per second
  onComplete,
  className = '',
  showCursor = true,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      setIsComplete(false)
      return
    }

    setDisplayedText('')
    setIsComplete(false)

    const chars = text.split('')
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < chars.length) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        if (onComplete) {
          onComplete()
        }
      }
    }, 1000 / speed) // Convert characters per second to interval

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="animate-pulse text-green-500">|</span>
      )}
    </span>
  )
}

interface DefinitionLoadingProps {
  word: string
  definition?: string
  definitionTarget?: string
  examples?: Array<{ sentence: string; translation: string }>
  usageNote?: string
  source?: 'database' | 'user_edit' | 'llm' | 'wikipedia' | 'notebook'
  isLoadingExamples?: boolean
}

export function DefinitionLoadingCard({
  word,
  definition,
  definitionTarget,
  examples,
  usageNote,
  source,
  isLoadingExamples = false,
}: DefinitionLoadingProps) {
  const [showDefinition, setShowDefinition] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [showUsageNote, setShowUsageNote] = useState(false)

  // Show definition immediately when word appears (consistent animation)
  useEffect(() => {
    if (word) {
      // Small delay for smooth appearance
      const timer = setTimeout(() => setShowDefinition(true), 100)
      return () => clearTimeout(timer)
    }
  }, [word])

  // Show examples when definition is available or when examples are loaded
  // Wait for definition to fully display before showing examples (definition on top)
  useEffect(() => {
    if (showDefinition && definitionTarget && (definitionTarget.length > 0)) {
      // Calculate time needed for definition to type out (definition should complete first)
      const definitionTypingTime = (definitionTarget.length / 40) * 1000 // 40 chars/sec
      // Show examples after definition finishes typing + small delay
      const timer = setTimeout(() => {
        if (examples && examples.length > 0) {
          setShowExamples(true)
        }
      }, definitionTypingTime + 300) // Wait for definition to finish + 300ms
      return () => clearTimeout(timer)
    }
  }, [showDefinition, definitionTarget, examples])

  // Show usage note when examples are available
  useEffect(() => {
    if (showExamples && usageNote) {
      // Start showing usage note after examples appear
      const timer = setTimeout(() => setShowUsageNote(true), 600)
      return () => clearTimeout(timer)
    }
  }, [showExamples, usageNote])

  const getSourceBadge = () => {
    if (!source) return null
    const badges = {
      database: { text: 'From Database', color: 'bg-green-100 text-green-700' },
      user_edit: { text: 'Your Custom', color: 'bg-purple-100 text-purple-700' },
      llm: { text: 'AI Generated', color: 'bg-blue-100 text-blue-700' },
      wikipedia: { text: 'From Wikipedia', color: 'bg-blue-100 text-blue-700' },
      notebook: { text: 'From Notebook', color: 'bg-yellow-100 text-yellow-700' },
    }
    const badge = badges[source]
    if (!badge) return null
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {word || <span className="text-gray-300">...</span>}
          </h1>
          {getSourceBadge()}
        </div>
      </div>

      {/* Definition Target */}
      {showDefinition && definitionTarget && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">
            Definition
          </h2>
          <div className="mb-3">
            <p className="text-base sm:text-lg text-gray-900 font-medium leading-relaxed">
              <TypingAnimation
                text={definitionTarget}
                speed={40}
                className="text-gray-900"
              />
            </p>
          </div>
          {definition && (
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              <TypingAnimation
                text={definition}
                speed={35}
                className="text-gray-700"
              />
            </p>
          )}
        </div>
      )}

      {/* Examples */}
      {showExamples && (
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">
            Examples
          </h2>
          {isLoadingExamples && (!examples || examples.length === 0) ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-400">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Generating examples...</span>
              </div>
            </div>
          ) : examples && examples.length > 0 ? (
            examples.map((example, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-400"
              >
                <div className="mb-1.5 sm:mb-2">
                  <p className="text-base sm:text-lg text-gray-900">
                    <TypingAnimation
                      text={example.sentence}
                      speed={30}
                      className="text-gray-900"
                    />
                  </p>
                </div>
                <p className="text-sm sm:text-base text-gray-600 italic ml-0 sm:ml-4">
                  <TypingAnimation
                    text={example.translation}
                    speed={35}
                    className="text-gray-600"
                  />
                </p>
              </div>
            ))
          ) : null}
        </div>
      )}

      {/* Usage Note */}
      {showUsageNote && usageNote && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-5 rounded-lg border-l-4 border-yellow-400">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Usage Note
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            <TypingAnimation
              text={usageNote}
              speed={30}
              className="text-gray-700"
            />
          </p>
        </div>
      )}

      {/* Loading indicator when content is still loading */}
      {(!showDefinition || !definitionTarget) && (
        <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Loading definition...</span>
        </div>
      )}
    </div>
  )
}

