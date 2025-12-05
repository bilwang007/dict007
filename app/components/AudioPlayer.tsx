'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, Loader2 } from 'lucide-react'

interface AudioPlayerProps {
  text: string
  language: string
  size?: 'sm' | 'md' | 'lg'
}

// Language code to browser speech synthesis language mapping
const getSpeechLang = (lang: string): string => {
  const langMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    zh: 'zh-CN',
    hi: 'hi-IN',
    ar: 'ar-SA',
    pt: 'pt-BR',
    bn: 'bn-BD',
    ru: 'ru-RU',
    ja: 'ja-JP',
    fr: 'fr-FR',
  }
  return langMap[lang] || 'en-US'
}

export default function AudioPlayer({ text, language, size = 'md' }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const handlePlay = async () => {
    // If using browser TTS and already speaking, stop and restart
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
    }

    // If audio element exists and is paused, just play
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
      return
    }

    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play()
      setIsPlaying(true)
      return
    }

    setIsLoading(true)

    try {
      // Try to generate audio from API first
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      })

      if (response.ok) {
        const blob = await response.blob()
        
        // Check if blob is not empty
        if (blob.size > 0) {
          const audioUrl = URL.createObjectURL(blob)
          const audio = new Audio(audioUrl)
          audioRef.current = audio

          audio.onplay = () => {
            setIsPlaying(true)
            setIsLoading(false)
          }

          audio.onpause = () => {
            setIsPlaying(false)
          }

          audio.onended = () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioUrl)
          }

          audio.onerror = () => {
            setIsLoading(false)
            setIsPlaying(false)
            URL.revokeObjectURL(audioUrl)
            // Fallback to browser TTS
            playBrowserTTS()
          }

          await audio.play()
          return
        }
      }

      // If API fails or returns empty, use browser TTS
      playBrowserTTS()
    } catch (error) {
      console.error('Error playing audio from API, using browser TTS:', error)
      // Fallback to browser TTS
      playBrowserTTS()
    }
  }

  const playBrowserTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('Browser speech synthesis not available')
      setIsLoading(false)
      setIsPlaying(false)
      return
    }

    try {
      const synth = window.speechSynthesis
      synthRef.current = synth

      // Cancel any ongoing speech
      synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = getSpeechLang(language)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => {
        setIsPlaying(true)
        setIsLoading(false)
      }

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        setIsLoading(false)
        setIsPlaying(false)
      }

      synth.speak(utterance)
    } catch (error) {
      console.error('Error using browser TTS:', error)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        handlePlay()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
      aria-label="Play pronunciation"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  )
}
