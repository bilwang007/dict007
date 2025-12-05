'use client'

import { useState, FormEvent } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface LookupFormProps {
  onLookup: (word: string) => void
  isLoading: boolean
}

export default function LookupForm({ onLookup, isLoading }: LookupFormProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onLookup(input.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a word, phrase, or sentence..."
          disabled={isLoading}
          className="w-full px-5 sm:px-6 py-4 sm:py-5 pl-12 sm:pl-14 pr-12 sm:pr-14 text-base sm:text-lg border border-gray-300 rounded-xl focus:border-gray-900 focus:outline-none bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
        {isLoading && (
          <Loader2 className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-900 animate-spin" />
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="w-full sm:w-auto sm:mx-auto sm:block px-6 sm:px-8 py-3 sm:py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm sm:text-base lg:text-lg"
      >
        {isLoading ? 'Looking up...' : 'Look Up'}
      </button>
    </form>
  )
}
