'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Maximize2, Minimize2 } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import type { Flashcard } from '@/app/lib/types'

interface FlashcardProps {
  card: Flashcard
  targetLanguage: string
  onNext?: () => void
}

export default function Flashcard({ card, targetLanguage, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontScale, setFontScale] = useState(1)
  const contentRef = useRef<HTMLDivElement>(null)

  // Calculate font scale based on content height and available space
  useEffect(() => {
    if (contentRef.current && isFlipped) {
      const content = contentRef.current
      const container = content.parentElement
      if (!container) return
      
      // Get available height (account for padding and header)
      const availableHeight = isFullscreen 
        ? window.innerHeight - 200 // Fullscreen: use window height minus padding
        : 400 // Normal: use fixed height
      
      const currentHeight = content.scrollHeight
      
      if (currentHeight > availableHeight) {
        // Scale down if content is too tall
        const scale = Math.max(0.7, Math.min(1, availableHeight / currentHeight))
        setFontScale(scale)
      } else {
        // Scale up if there's extra space (but not too much)
        const scale = Math.min(1.2, Math.max(1, availableHeight / currentHeight * 0.9))
        setFontScale(scale)
      }
    }
  }, [isFlipped, card, isFullscreen])

  const flipCard = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setShowTranslation(false)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-2xl mx-auto'}`}>
      <div className={`${isFullscreen ? 'h-screen flex items-center justify-center p-8' : ''}`}>
        <div className="relative w-full" style={{ height: isFullscreen ? '100%' : '500px' }}>
          {/* Fullscreen toggle - positioned to not block audio button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFullscreen()
            }}
            className={`absolute z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors ${
              isFlipped ? 'top-4 right-16 sm:right-20' : 'top-4 right-4'
            }`}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-700" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-700" />
            )}
          </button>

          <motion.div
            data-flashcard
            className="relative w-full h-full cursor-pointer"
            onClick={flipCard}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of card - Apple style */}
            <div
              className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-8"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
              }}
            >
              {card.imageUrl && card.imageUrl.trim() !== '' && !imageError ? (
                <div className="w-full max-w-xs h-64 mb-6 rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={card.imageUrl}
                    alt={card.word}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                    unoptimized
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-full max-w-xs h-64 mb-6 rounded-xl bg-gray-50 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-baseline gap-3">
                  <h2 className={`font-light text-gray-900 tracking-tight ${isFullscreen ? 'text-7xl sm:text-8xl' : 'text-4xl sm:text-5xl'}`}>
                    {card.word}
                  </h2>
                  {card.phonetic && (
                    <span className={`text-gray-500 font-light ${isFullscreen ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>
                      /{card.phonetic}/
                    </span>
                  )}
                </div>
                <p className={`text-gray-500 font-medium ${isFullscreen ? 'text-lg' : 'text-sm'}`}>Tap to flip</p>
              </div>
            </div>

            {/* Back of card - Apple style */}
            <div
              ref={contentRef}
              className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col p-8"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                fontSize: `${fontScale}rem`,
              }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-baseline gap-3 flex-1 min-w-0">
                  <h2 className={`font-light text-gray-900 tracking-tight ${isFullscreen ? 'text-6xl' : 'text-3xl sm:text-4xl'}`} style={{ fontSize: isFullscreen ? `${fontScale * 3}rem` : undefined }}>
                    {card.word}
                  </h2>
                  {card.phonetic && (
                    <span className={`text-gray-500 font-light ${isFullscreen ? 'text-3xl' : 'text-xl sm:text-2xl'}`} style={{ fontSize: isFullscreen ? `${fontScale * 1.5}rem` : undefined }}>
                      /{card.phonetic}/
                    </span>
                  )}
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  className="flex-shrink-0"
                >
                  <AudioPlayer text={card.word} language={targetLanguage} size={isFullscreen ? "md" : "sm"} />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6 overflow-hidden">
                {/* Definition in target language */}
                {card.definitionTarget && (
                  <div>
                    <div className="flex items-start gap-3 mb-2">
                      <p className="text-gray-900 font-light leading-relaxed flex-1" style={{ 
                        fontSize: isFullscreen 
                          ? `${fontScale * 2.5}rem` 
                          : `${fontScale * 1.25}rem`,
                        lineHeight: '1.5'
                      }}>
                        {card.definitionTarget}
                      </p>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                        className="flex-shrink-0"
                      >
                        <AudioPlayer text={card.definitionTarget} language={targetLanguage} size={isFullscreen ? "md" : "sm"} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Definition in native language */}
                <p className="text-gray-600 font-light leading-relaxed" style={{ 
                  fontSize: isFullscreen 
                    ? `${fontScale * 2}rem` 
                    : `${fontScale * 1.1}rem`,
                  lineHeight: '1.5'
                }}>
                  {card.definition}
                </p>

                {/* Example sentence */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-gray-900 font-light leading-relaxed flex-1" style={{ 
                      fontSize: isFullscreen 
                        ? `${fontScale * 2}rem` 
                        : `${fontScale * 1.1}rem`,
                      lineHeight: '1.5'
                    }}>
                      {card.exampleSentence}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                      >
                        <AudioPlayer text={card.exampleSentence} language={targetLanguage} size={isFullscreen ? "md" : "sm"} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowTranslation(!showTranslation)
                        }}
                        className={`px-3 py-1.5 font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${isFullscreen ? 'text-base' : 'text-xs'}`}
                      >
                        {showTranslation ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {showTranslation && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-gray-500 italic mt-3 leading-relaxed"
                        style={{ 
                          fontSize: isFullscreen 
                            ? `${fontScale * 1.5}rem` 
                            : `${fontScale * 0.95}rem`,
                          lineHeight: '1.5'
                        }}
                      >
                        {card.exampleTranslation}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <p className="text-gray-400 text-sm text-center mt-6 font-medium">Tap to flip back</p>
            </div>
          </motion.div>

          {isFlipped && onNext && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                setIsFlipped(false)
                onNext()
              }}
              className="mt-6 w-full px-6 py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors active:scale-[0.98]"
            >
              Next Card
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
