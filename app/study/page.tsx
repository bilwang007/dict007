'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import Navigation from '../components/Navigation'
import Flashcard from '../components/Flashcard'
import { getNotebookEntries } from '../lib/storage-supabase'
import type { Flashcard as FlashcardType } from '../lib/types'

export default function StudyPage() {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const fetchFlashcards = async () => {
    setIsLoading(true)
    try {
      const entries = await getNotebookEntries()
      
      const cards: FlashcardType[] = entries.map(entry => ({
        id: entry.id,
        word: entry.word,
        phonetic: (entry as any).phonetic, // Phonetic transcription (音标)
        imageUrl: entry.imageUrl || '',
        definition: entry.definition,
        definitionTarget: entry.definitionTarget,
        exampleSentence: entry.exampleSentence1,
        exampleTranslation: entry.exampleTranslation1,
        targetLanguage: entry.targetLanguage,
      }))
      
      const shuffled = [...cards].sort(() => Math.random() - 0.5)
      setFlashcards(shuffled)
    } catch (error: any) {
      console.error('Error fetching flashcards:', error)
      setFlashcards([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev < flashcards.length - 1) {
        setDirection(1)
        return prev + 1
      } else {
        setDirection(1)
        return 0
      }
    })
  }, [flashcards.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev > 0) {
        setDirection(-1)
        return prev - 1
      } else {
        setDirection(-1)
        return flashcards.length - 1
      }
    })
  }, [flashcards.length])

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setFlashcards(shuffled)
    setCurrentIndex(0)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || 
          (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case ' ': // Spacebar
          e.preventDefault()
          // Flip card - trigger click on flashcard
          const flashcardElement = document.querySelector('[data-flashcard]')
          if (flashcardElement) {
            (flashcardElement as HTMLElement).click()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, flashcards.length, handleNext, handlePrevious])

  // Swipe gestures for mobile (thumb movement)
  useEffect(() => {
    let touchStartX = 0
    let touchEndX = 0
    const minSwipeDistance = 50 // Minimum distance for swipe

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX
      const swipeDistance = touchEndX - touchStartX

      // Don't trigger if user is interacting with a button or input
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
        return
      }

      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe right - previous
          handlePrevious()
        } else {
          // Swipe left - next
          handleNext()
        }
      }
    }

    const flashcardElement = document.querySelector('[data-flashcard]') as HTMLElement | null
    if (flashcardElement) {
      flashcardElement.addEventListener('touchstart', handleTouchStart, { passive: true })
      flashcardElement.addEventListener('touchend', handleTouchEnd, { passive: true })
      
      return () => {
        flashcardElement.removeEventListener('touchstart', handleTouchStart)
        flashcardElement.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [currentIndex, flashcards.length, handleNext, handlePrevious])

  // Page turn animation variants
  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 90 : -90,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      rotateY: direction > 0 ? -90 : 90,
      scale: 0.8,
    }),
  }

  const pageTransition = {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.5,
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading flashcards...</p>
        </div>
      </main>
    )
  }

  if (flashcards.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />

          <div className="mb-12">
            <h1 className="text-5xl font-light text-gray-900 tracking-tight mb-2">Study Mode</h1>
            <p className="text-gray-500 text-lg">Practice with flashcards</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-xl text-gray-900 font-light mb-2">No flashcards available</p>
            <p className="text-gray-500 mb-8">
              Add some words to your notebook to start studying
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Look Up Words
              </Link>
              <Link
                href="/notebook"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                View Notebook
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-light text-gray-900 tracking-tight mb-1">Study Mode</h1>
            <p className="text-gray-500 text-sm font-medium">
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Shuffle
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-100 rounded-full h-1">
            <motion.div
              className="bg-gray-900 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>

        {/* Flashcard with Page Turn Animation */}
        <div className="mb-4 relative" style={{ minHeight: '600px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              style={{ perspective: '1000px' }}
            >
              <Flashcard
                card={currentCard}
                targetLanguage={currentCard.targetLanguage}
                onNext={handleNext}
                onPrevious={handlePrevious}
                showNavigation={true}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons - Closer to card */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={handlePrevious}
            disabled={flashcards.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            title="Previous card (← Arrow Left)"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={flashcards.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            title="Next card (→ Arrow Right)"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Space</kbd> to flip • 
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs ml-1">←</kbd> Previous • 
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs ml-1">→</kbd> Next
          </p>
        </div>
      </div>
    </main>
  )
}
