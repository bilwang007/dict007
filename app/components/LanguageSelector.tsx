'use client'

import { LANGUAGES, type LanguageCode } from '@/app/lib/types'
import { useState, useEffect } from 'react'

interface LanguageSelectorProps {
  onNativeLanguageChange: (code: LanguageCode) => void
  onTargetLanguageChange: (code: LanguageCode) => void
  initialNative?: LanguageCode
  initialTarget?: LanguageCode
}

export default function LanguageSelector({
  onNativeLanguageChange,
  onTargetLanguageChange,
  initialNative,
  initialTarget,
}: LanguageSelectorProps) {
  const [nativeLang, setNativeLang] = useState<LanguageCode>(initialNative || 'zh')
  const [targetLang, setTargetLang] = useState<LanguageCode>(initialTarget || 'en')

  useEffect(() => {
    // Load from localStorage on mount
    const savedNative = localStorage.getItem('nativeLanguage') as LanguageCode
    const savedTarget = localStorage.getItem('targetLanguage') as LanguageCode
    if (savedNative && LANGUAGES.some(l => l.code === savedNative)) {
      setNativeLang(savedNative)
      onNativeLanguageChange(savedNative)
    }
    if (savedTarget && LANGUAGES.some(l => l.code === savedTarget)) {
      setTargetLang(savedTarget)
      onTargetLanguageChange(savedTarget)
    }
  }, [])

  const handleNativeChange = (code: LanguageCode) => {
    setNativeLang(code)
    localStorage.setItem('nativeLanguage', code)
    onNativeLanguageChange(code)
  }

  const handleTargetChange = (code: LanguageCode) => {
    setTargetLang(code)
    localStorage.setItem('targetLanguage', code)
    onTargetLanguageChange(code)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Your Native Language
        </label>
        <select
          value={nativeLang}
          onChange={(e) => handleNativeChange(e.target.value as LanguageCode)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none bg-white text-gray-900 text-base focus:ring-0 focus:ring-offset-0"
          style={{ 
            borderColor: 'rgb(209 213 219) !important',
            outline: 'none',
            boxShadow: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgb(17 24 39)';
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgb(209 213 219)';
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
          Target Language
        </label>
        <select
          value={targetLang}
          onChange={(e) => handleTargetChange(e.target.value as LanguageCode)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none bg-white text-gray-900 text-base focus:ring-0 focus:ring-offset-0"
          style={{ 
            borderColor: 'rgb(209 213 219) !important',
            outline: 'none',
            boxShadow: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgb(17 24 39)';
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgb(209 213 219)';
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
