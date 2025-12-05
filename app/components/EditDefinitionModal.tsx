'use client'

import { useState, useEffect } from 'react'
import { X, Save, RotateCcw } from 'lucide-react'
import type { LookupResult } from '@/app/lib/types'

interface EditDefinitionModalProps {
  result: LookupResult
  isOpen: boolean
  onClose: () => void
  onSave: (edited: Partial<LookupResult>) => Promise<void>
  onRevert?: () => Promise<void>
}

export default function EditDefinitionModal({
  result,
  isOpen,
  onClose,
  onSave,
  onRevert,
}: EditDefinitionModalProps) {
  const [edited, setEdited] = useState<Partial<LookupResult>>({
    definitionTarget: result.definitionTarget,
    definition: result.definition,
    examples: result.examples,
    usageNote: result.usageNote,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isReverting, setIsReverting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setEdited({
        definitionTarget: result.definitionTarget,
        definition: result.definition,
        examples: result.examples,
        usageNote: result.usageNote,
      })
    }
  }, [isOpen, result])

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(edited)
      onClose()
    } catch (error) {
      console.error('Error saving edit:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevert = async () => {
    if (!onRevert) return
    setIsReverting(true)
    try {
      await onRevert()
      onClose()
    } catch (error) {
      console.error('Error reverting:', error)
    } finally {
      setIsReverting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Edit Definition for &quot;{result.word}&quot;
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Definition Target */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Definition (Target Language)
            </label>
            <textarea
              value={edited.definitionTarget || ''}
              onChange={(e) => setEdited({ ...edited, definitionTarget: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Enter definition in target language..."
            />
          </div>

          {/* Definition (Native) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Definition (Your Language)
            </label>
            <textarea
              value={edited.definition || ''}
              onChange={(e) => setEdited({ ...edited, definition: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Enter definition in your native language..."
            />
          </div>

          {/* Examples */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Example Sentences
            </label>
            <div className="space-y-4">
              {edited.examples?.map((example, index) => (
                <div key={index} className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sentence {index + 1}</label>
                    <input
                      type="text"
                      value={example.sentence}
                      onChange={(e) => {
                        const newExamples = [...(edited.examples || [])]
                        newExamples[index] = { ...newExamples[index], sentence: e.target.value }
                        setEdited({ ...edited, examples: newExamples })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="Example sentence..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Translation {index + 1}</label>
                    <input
                      type="text"
                      value={example.translation}
                      onChange={(e) => {
                        const newExamples = [...(edited.examples || [])]
                        newExamples[index] = { ...newExamples[index], translation: e.target.value }
                        setEdited({ ...edited, examples: newExamples })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="Translation..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usage Note
            </label>
            <textarea
              value={edited.usageNote || ''}
              onChange={(e) => setEdited({ ...edited, usageNote: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none resize-none"
              rows={4}
              placeholder="Enter usage note..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {result.source === 'user_edit' && (
              <span className="text-blue-600">You&apos;re viewing your custom edit</span>
            )}
            {result.source === 'database' && (
              <span className="text-green-600">From database</span>
            )}
            {result.source === 'llm' && (
              <span className="text-purple-600">Generated by AI</span>
            )}
          </div>
          <div className="flex gap-3">
            {result.source === 'user_edit' && onRevert && (
              <button
                onClick={handleRevert}
                disabled={isReverting}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revert to Original</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save for Me'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

