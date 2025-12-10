'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, GraduationCap, Sparkles, ImageIcon, Volume2, CheckCircle, ArrowRight, X } from 'lucide-react'
import Navigation from '../components/Navigation'
import { createClient } from '../lib/supabase/client'

const translations = {
  en: {
    title: 'Welcome to AI Dictionary!',
    subtitle: 'Learn languages with AI-powered definitions, images, and audio',
    getStarted: 'Get Started',
    skip: 'Skip',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    step1: {
      title: 'Look Up Words',
      description: 'Enter any word, phrase, or sentence in the search bar. Get instant definitions with multiple meanings, examples, and usage notes.',
      tip: 'Try searching for words with multiple meanings like "bank" or "run"!'
    },
    step2: {
      title: 'Save to Notebook',
      description: 'Click "Save to Notebook" to save words you want to practice. Each meaning is saved separately for focused learning.',
      tip: 'Saved words appear in your Notebook page for easy review!'
    },
    step3: {
      title: 'Study with Flashcards',
      description: 'Go to Study Mode to practice with interactive flashcards. Flip cards to see definitions and examples.',
      tip: 'Use keyboard shortcuts: Space to flip, Arrow keys to navigate!'
    },
    step4: {
      title: 'Generate Images',
      description: 'Click "Generate Image" to create visual representations for each meaning. Images help with memorization!',
      tip: 'Images are generated on-demand, so you control when they\'re created.'
    },
    step5: {
      title: 'Listen to Pronunciation',
      description: 'Click the audio button to hear how words are pronounced. Perfect for improving your accent!',
      tip: 'Audio works in your browser - no extra setup needed!'
    },
    step6: {
      title: 'Filter & Organize',
      description: 'Use tags and date filters in your Notebook to organize words. System tags like "Last 7 Days" help you focus on recent words.',
      tip: 'Create custom tags to group related words together!'
    },
    help: 'Need help? Visit this page anytime from the Help section in your profile!'
  },
  zh: {
    title: '欢迎使用 AI 词典！',
    subtitle: '通过 AI 驱动的定义、图片和音频学习语言',
    getStarted: '开始使用',
    skip: '跳过',
    close: '关闭',
    next: '下一步',
    previous: '上一步',
    finish: '完成',
    step1: {
      title: '查找单词',
      description: '在搜索栏中输入任何单词、短语或句子。获取即时定义，包括多种含义、例句和使用说明。',
      tip: '试试搜索有多重含义的单词，比如 "bank" 或 "run"！'
    },
    step2: {
      title: '保存到笔记本',
      description: '点击"保存到笔记本"来保存你想练习的单词。每个含义都会单独保存，便于集中学习。',
      tip: '保存的单词会出现在你的笔记本页面，方便复习！'
    },
    step3: {
      title: '使用抽认卡学习',
      description: '进入学习模式，使用交互式抽认卡进行练习。翻转卡片查看定义和例句。',
      tip: '使用键盘快捷键：空格键翻转，方向键导航！'
    },
    step4: {
      title: '生成图片',
      description: '点击"生成图片"为每个含义创建视觉表示。图片有助于记忆！',
      tip: '图片是按需生成的，所以你可以控制何时创建它们。'
    },
    step5: {
      title: '听发音',
      description: '点击音频按钮听取单词的发音。非常适合改善你的口音！',
      tip: '音频在浏览器中工作 - 无需额外设置！'
    },
    step6: {
      title: '筛选和组织',
      description: '在笔记本中使用标签和日期筛选器来组织单词。系统标签如"最近 7 天"帮助你专注于最近的单词。',
      tip: '创建自定义标签来将相关单词分组！'
    },
    help: '需要帮助？随时从个人资料中的帮助部分访问此页面！'
  }
}

const steps = [
  { icon: Search, key: 'step1' },
  { icon: BookOpen, key: 'step2' },
  { icon: GraduationCap, key: 'step3' },
  { icon: ImageIcon, key: 'step4' },
  { icon: Volume2, key: 'step5' },
  { icon: Sparkles, key: 'step6' },
]

export default function WelcomePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [uiLanguage, setUiLanguage] = useState<'en' | 'zh'>('en')
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // Check if this is first visit
    const hasVisited = localStorage.getItem('hasVisitedWelcome')
    if (!hasVisited) {
      setIsFirstVisit(true)
      localStorage.setItem('hasVisitedWelcome', 'true')
    }

    // Load UI language from profile or localStorage
    const loadLanguage = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            const profile = data.profile || data
            if (profile.ui_language) {
              setUiLanguage(profile.ui_language)
              return
            }
          }
        }
      } catch (error) {
        console.error('Error loading language:', error)
      }
      // Fallback to localStorage
      const savedLang = localStorage.getItem('uiLanguage') as 'en' | 'zh'
      if (savedLang) {
        setUiLanguage(savedLang)
      }
    }
    loadLanguage()
  }, [])

  const t = translations[uiLanguage]
  const currentStepData = steps[currentStep]
  const StepIcon = currentStepData.icon
  const stepContent = t[currentStepData.key as keyof typeof t] as { title: string; description: string; tip: string }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    setShowWelcome(false)
    if (isFirstVisit) {
      router.push('/')
    }
  }

  const handleSkip = () => {
    setShowWelcome(false)
    if (isFirstVisit) {
      router.push('/')
    }
  }

  if (!showWelcome) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-3">{t.title}</h1>
            <p className="text-lg text-gray-600">{t.subtitle}</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-gray-900 w-8'
                      : index < currentStep
                      ? 'bg-gray-400 w-2'
                      : 'bg-gray-200 w-2'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-8 min-h-[300px] flex flex-col items-center justify-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <StepIcon className="w-10 h-10 text-gray-700" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4 text-center">
              {stepContent.title}
            </h2>
            <p className="text-lg text-gray-700 mb-4 text-center max-w-2xl leading-relaxed">
              {stepContent.description}
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg max-w-2xl">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> {stepContent.tip}
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.previous}
            </button>

            <div className="flex gap-2">
              {isFirstVisit && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {t.skip}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {currentStep === steps.length - 1 ? t.finish : t.next}
                {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Help Note */}
          {!isFirstVisit && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">{t.help}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

