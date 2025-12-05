'use client'

import { useState } from 'react'
import { BookOpen, Languages, Eye, EyeOff } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import type { Story } from '@/app/lib/types'

interface StoryViewProps {
  story: Story
  targetLanguage: string
}

export default function StoryView({ story, targetLanguage }: StoryViewProps) {
  const [showTranslation, setShowTranslation] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-light text-gray-900">Your Story</h2>
        </div>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors active:scale-[0.98] font-medium"
        >
          {showTranslation ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="hidden sm:inline">Hide Translation</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Show Translation</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Story in target language */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-light text-gray-900">Story ({targetLanguage})</h3>
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <AudioPlayer text={story.content} language={targetLanguage} size="md" />
            </div>
          </div>
          <p className="text-gray-900 text-lg font-light leading-relaxed whitespace-pre-line">
            {story.content}
          </p>
        </div>

        {/* Translation - Toggleable */}
        {showTranslation && (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl animate-fade-in">
            <h3 className="text-lg font-light text-gray-900 mb-3">Translation</h3>
            <p className="text-gray-900 text-lg font-light leading-relaxed whitespace-pre-line">
              {story.translation}
            </p>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-6 font-medium">
        Created: {new Date(story.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
