'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import { getNotebookEntries } from '../lib/storage-supabase'
import type { NotebookEntry, LanguageCode } from '../lib/types'

interface QuizQuestion {
  id: string
  word: string
  sentence: string
  translation: string
  blankIndex: number
  correctAnswer: string
  userAnswer: string
  isCorrect: boolean | null
}

export default function QuizPage() {
  const [entries, setEntries] = useState<NotebookEntry[]>([])
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [isQuizFinished, setIsQuizFinished] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const data = await getNotebookEntries()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
      setEntries([])
    }
  }

  const generateQuestions = () => {
    if (selectedEntries.size === 0) {
      return
    }

    const selectedWords = entries.filter(e => selectedEntries.has(e.id))
    const generatedQuestions: QuizQuestion[] = []

    selectedWords.forEach(entry => {
      // Use example sentences to create fill-in-the-blank questions
      const sentences = [
        { sentence: entry.exampleSentence1, translation: entry.exampleTranslation1 },
        { sentence: entry.exampleSentence2, translation: entry.exampleTranslation2 },
      ].filter(s => s.sentence && s.sentence.trim())

      sentences.forEach(({ sentence, translation }) => {
        if (!sentence) return

        // Find the word in the sentence (case-insensitive)
        const wordRegex = new RegExp(`\\b${entry.word}\\b`, 'gi')
        const match = sentence.match(wordRegex)
        
        if (match) {
          // Replace the word with blank
          const blankedSentence = sentence.replace(wordRegex, '______')
          const blankIndex = blankedSentence.indexOf('______')
          
          generatedQuestions.push({
            id: `${entry.id}-${generatedQuestions.length}`,
            word: entry.word,
            sentence: blankedSentence,
            translation: translation || '',
            blankIndex,
            correctAnswer: entry.word,
            userAnswer: '',
            isCorrect: null,
          })
        }
      })
    })

    // Shuffle questions
    const shuffled = [...generatedQuestions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled)
    setCurrentQuestionIndex(0)
    setIsQuizStarted(true)
    setIsQuizFinished(false)
    setScore({ correct: 0, total: shuffled.length })
  }

  const handleAnswer = (answer: string) => {
    if (isQuizFinished) return

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
    
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer.trim(),
      isCorrect,
    }
    setQuestions(updatedQuestions)

    // Update score
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total,
    }))

    // Move to next question after 1 second
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setIsQuizFinished(true)
      }
    }, 1000)
  }

  const resetQuiz = () => {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setIsQuizStarted(false)
    setIsQuizFinished(false)
    setScore({ correct: 0, total: 0 })
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 tracking-tight mb-2">Quiz Mode</h1>
          <p className="text-gray-500 text-lg">Fill in the blank with translation</p>
        </div>

        {!isQuizStarted ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Words for Quiz</h2>
            
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No words in your notebook yet</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Words
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedEntries.size} word{selectedEntries.size !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedEntries(new Set(entries.map(e => e.id)))}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedEntries(new Set())}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                  {entries.map(entry => (
                    <label
                      key={entry.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEntries(new Set([...selectedEntries, entry.id]))
                          } else {
                            const newSet = new Set(selectedEntries)
                            newSet.delete(entry.id)
                            setSelectedEntries(newSet)
                          }
                        }}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.word}</p>
                        <p className="text-sm text-gray-600">{entry.definitionTarget || entry.definition}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={generateQuestions}
                  disabled={selectedEntries.size === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Start Quiz
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            {!isQuizFinished ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      Score: {score.correct}/{score.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-lg sm:text-xl text-gray-700 mb-4 leading-relaxed">
                    {currentQuestion.sentence}
                  </p>
                  <p className="text-base text-gray-500 italic mb-6">
                    {currentQuestion.translation}
                  </p>

                  {currentQuestion.isCorrect === null ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAnswer((e.target as HTMLInputElement).value)
                          }
                        }}
                        className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                        style={{ color: 'rgb(17, 24, 39)' }}
                        placeholder="Type your answer..."
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[type="text"]') as HTMLInputElement
                          if (input) handleAnswer(input.value)
                        }}
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        Submit Answer
                      </button>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg ${currentQuestion.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        {currentQuestion.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                        <span className={`font-medium ${currentQuestion.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {currentQuestion.isCorrect ? 'Correct!' : `Wrong! Correct answer: ${currentQuestion.correctAnswer}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-3xl font-semibold text-gray-900 mb-4">Quiz Complete!</h2>
                <div className="mb-6">
                  <p className="text-5xl font-light text-gray-900 mb-2">
                    {score.correct}/{score.total}
                  </p>
                  <p className="text-lg text-gray-600">
                    {Math.round((score.correct / score.total) * 100)}% Correct
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetQuiz}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>
                  <Link
                    href="/notebook"
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Notebook
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

