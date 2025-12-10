'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, LogOut, Edit2, Globe, Target, Bell, Palette } from 'lucide-react'
import Navigation from '../components/Navigation'
import { createClient } from '@/app/lib/supabase/client'
import { LANGUAGES, type LanguageCode } from '../lib/types'

// Translation strings
const translations = {
  en: {
    profile: 'Profile',
    editProfile: 'Edit Profile',
    save: 'Save',
    cancel: 'Cancel',
    fullName: 'Full Name',
    bio: 'Bio',
    email: 'Email',
    joined: 'Joined',
    uiLanguage: 'Interface Language',
    preferredLanguages: 'Preferred Languages',
    learningGoals: 'Learning Goals',
    dailyGoal: 'Daily Goal',
    wordsPerDay: 'words per day',
    notifications: 'Notifications',
    enabled: 'Enabled',
    disabled: 'Disabled',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    logout: 'Logout',
    notSet: 'Not set',
    selectLanguages: 'Select languages you want to learn',
    enterBio: 'Tell us about yourself',
    enterGoals: 'What are your learning goals?',
    saveSuccess: 'Profile updated successfully!',
    saveError: 'Failed to update profile',
  },
  zh: {
    profile: '个人资料',
    editProfile: '编辑资料',
    save: '保存',
    cancel: '取消',
    fullName: '姓名',
    bio: '简介',
    email: '邮箱',
    joined: '加入时间',
    uiLanguage: '界面语言',
    preferredLanguages: '偏好语言',
    learningGoals: '学习目标',
    dailyGoal: '每日目标',
    wordsPerDay: '个单词/天',
    notifications: '通知',
    enabled: '启用',
    disabled: '禁用',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    auto: '自动',
    logout: '退出登录',
    notSet: '未设置',
    selectLanguages: '选择您想学习的语言',
    enterBio: '介绍一下自己',
    enterGoals: '您的学习目标是什么？',
    saveSuccess: '资料更新成功！',
    saveError: '更新资料失败',
  },
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [uiLanguage, setUiLanguage] = useState<'en' | 'zh'>('en')
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [learningGoals, setLearningGoals] = useState('')
  const [dailyGoal, setDailyGoal] = useState(10)
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  
  // Per-field editing and saving states
  const [editingField, setEditingField] = useState<string | null>(null)
  const [savingField, setSavingField] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [fieldSuccess, setFieldSuccess] = useState<Record<string, boolean>>({})

  const t = translations[uiLanguage]

  useEffect(() => {
    const supabase = createClient()
    
    // Get user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/login?redirect=/profile')
        return
      }
      setUser(session.user)
      setLoading(false)
      
      // Fetch user profile
      fetchProfile(session.user.id)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login?redirect=/profile')
      } else {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile || data)
        
        // Populate form fields
        if (data.profile || data) {
          const p = data.profile || data
          setFullName(p.full_name || '')
          setBio(p.bio || '')
          // Only update uiLanguage if it's different to avoid re-render loops
          const newUiLanguage = p.ui_language || 'en'
          if (newUiLanguage !== uiLanguage) {
            setUiLanguage(newUiLanguage as 'en' | 'zh')
          }
          setPreferredLanguages(p.preferred_languages || [])
          setLearningGoals(p.learning_goals || '')
          setDailyGoal(p.daily_goal || 10)
          setNotificationEnabled(p.notification_enabled !== false)
          const newTheme = p.theme || 'light'
          setTheme(newTheme as 'light' | 'dark' | 'auto')
          
          // Apply theme immediately
          if (typeof window !== 'undefined') {
            const html = document.documentElement
            if (newTheme === 'dark') {
              html.classList.add('dark')
              html.style.colorScheme = 'dark'
            } else if (newTheme === 'light') {
              html.classList.remove('dark')
              html.style.colorScheme = 'light'
            } else if (newTheme === 'auto') {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
              if (prefersDark) {
                html.classList.add('dark')
                html.style.colorScheme = 'dark'
              } else {
                html.classList.remove('dark')
                html.style.colorScheme = 'light'
              }
            }
            localStorage.setItem('theme', newTheme)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Save individual field
  const handleSaveField = async (fieldName: string, value: any) => {
    setSavingField(fieldName)
    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }))
    setFieldSuccess(prev => ({ ...prev, [fieldName]: false }))
    
    try {
      const updateData: any = {}
      
      // Map field names to API field names
      switch (fieldName) {
        case 'fullName':
          updateData.fullName = value
          break
        case 'bio':
          updateData.bio = value
          break
        case 'uiLanguage':
          updateData.uiLanguage = value
          break
        case 'preferredLanguages':
          updateData.preferredLanguages = value
          break
        case 'learningGoals':
          updateData.learningGoals = value
          break
        case 'dailyGoal':
          updateData.dailyGoal = value
          break
        case 'notificationEnabled':
          updateData.notificationEnabled = value
          break
        case 'theme':
          updateData.theme = value
          break
        default:
          throw new Error(`Unknown field: ${fieldName}`)
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditingField(null)
        setFieldSuccess(prev => ({ ...prev, [fieldName]: true }))
        
        // Apply theme immediately if theme was changed
        if (fieldName === 'theme' && typeof window !== 'undefined') {
          const html = document.documentElement
          if (value === 'dark') {
            html.classList.add('dark')
            html.style.colorScheme = 'dark'
          } else if (value === 'light') {
            html.classList.remove('dark')
            html.style.colorScheme = 'light'
          } else if (value === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (prefersDark) {
              html.classList.add('dark')
              html.style.colorScheme = 'dark'
            } else {
              html.classList.remove('dark')
              html.style.colorScheme = 'light'
            }
          }
          localStorage.setItem('theme', value)
        }
        
        // Apply UI language immediately if changed
        if (fieldName === 'uiLanguage' && typeof window !== 'undefined') {
          // Reload page to apply new language (or use a more elegant solution)
          // For now, just update localStorage
          localStorage.setItem('uiLanguage', value)
        }
        
        // Clear success message after 2 seconds
        setTimeout(() => {
          setFieldSuccess(prev => ({ ...prev, [fieldName]: false }))
        }, 2000)
        
        // Refresh profile to get latest data
        fetchProfile(user.id)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update' }))
        setFieldErrors(prev => ({ ...prev, [fieldName]: errorData.error || t.saveError }))
        throw new Error(errorData.error || 'Failed to update')
      }
    } catch (error: any) {
      console.error(`Error saving ${fieldName}:`, error)
      setFieldErrors(prev => ({ ...prev, [fieldName]: error.message || t.saveError }))
    } finally {
      setSavingField(null)
    }
  }
  
  // Cancel editing a field
  const handleCancelEdit = (fieldName: string) => {
    setEditingField(null)
    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }))
    // Reset to original value from profile
    fetchProfile(user.id)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const toggleLanguage = (langCode: string) => {
    setPreferredLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(l => l !== langCode)
      } else {
        return [...prev, langCode]
      }
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Navigation />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Navigation />

        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t.profile}
            </h1>
          </div>

          <div className="space-y-6">
            {/* User Info Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl sm:text-3xl font-bold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                {editingField === 'fullName' ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.fullName}
                      className="flex-1 text-xl sm:text-2xl font-semibold text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('fullName', fullName)}
                      disabled={savingField === 'fullName'}
                      className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                    >
                      {savingField === 'fullName' ? '...' : t.save}
                    </button>
                    <button
                      onClick={() => handleCancelEdit('fullName')}
                      disabled={savingField === 'fullName'}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex-1">
                      {fullName || user.email?.split('@')[0] || 'User'}
                    </h2>
                    <button
                      onClick={() => setEditingField('fullName')}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {fieldErrors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.fullName}</p>
                )}
                {fieldSuccess.fullName && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
                <div className="space-y-2 text-sm sm:text-base text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{t.joined} {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t.bio}
                  </label>
                  {editingField !== 'bio' && (
                    <button
                      onClick={() => setEditingField('bio')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'bio' ? (
                  <div className="space-y-2">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t.enterBio}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField('bio', bio)}
                        disabled={savingField === 'bio'}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {savingField === 'bio' ? '...' : t.save}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('bio')}
                        disabled={savingField === 'bio'}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{bio || t.notSet}</p>
                )}
                {fieldErrors.bio && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.bio}</p>
                )}
                {fieldSuccess.bio && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
              </div>

              {/* UI Language */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t.uiLanguage}
                  </label>
                  {editingField !== 'uiLanguage' && (
                    <button
                      onClick={() => setEditingField('uiLanguage')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'uiLanguage' ? (
                  <div className="space-y-2">
                    <select
                      value={uiLanguage}
                      onChange={(e) => {
                        const newValue = e.target.value as 'en' | 'zh'
                        setUiLanguage(newValue)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: 'rgb(17 24 39)' }}
                    >
                      <option value="en" style={{ color: 'rgb(17 24 39)' }}>English</option>
                      <option value="zh" style={{ color: 'rgb(17 24 39)' }}>简体中文</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Use the current uiLanguage state value directly
                          handleSaveField('uiLanguage', uiLanguage)
                        }}
                        disabled={savingField === 'uiLanguage'}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {savingField === 'uiLanguage' ? '...' : t.save}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('uiLanguage')}
                        disabled={savingField === 'uiLanguage'}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{uiLanguage === 'en' ? 'English' : '简体中文'}</p>
                )}
                {fieldErrors.uiLanguage && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.uiLanguage}</p>
                )}
                {fieldSuccess.uiLanguage && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
              </div>

              {/* Preferred Languages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t.preferredLanguages}
                  </label>
                  {editingField !== 'preferredLanguages' && (
                    <button
                      onClick={() => setEditingField('preferredLanguages')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'preferredLanguages' ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => toggleLanguage(lang.code)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            preferredLanguages.includes(lang.code)
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField('preferredLanguages', preferredLanguages)}
                        disabled={savingField === 'preferredLanguages'}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {savingField === 'preferredLanguages' ? '...' : t.save}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('preferredLanguages')}
                        disabled={savingField === 'preferredLanguages'}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {preferredLanguages.length > 0 ? (
                      preferredLanguages.map(langCode => {
                        const lang = LANGUAGES.find(l => l.code === langCode)
                        return lang ? (
                          <span
                            key={langCode}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {lang.name}
                          </span>
                        ) : null
                      })
                    ) : (
                      <span className="text-gray-500">{t.notSet}</span>
                    )}
                  </div>
                )}
                {fieldErrors.preferredLanguages && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.preferredLanguages}</p>
                )}
                {fieldSuccess.preferredLanguages && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
              </div>

              {/* Learning Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t.learningGoals}
                  </label>
                  {editingField !== 'learningGoals' && (
                    <button
                      onClick={() => setEditingField('learningGoals')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'learningGoals' ? (
                  <div className="space-y-2">
                    <textarea
                      value={learningGoals}
                      onChange={(e) => setLearningGoals(e.target.value)}
                      placeholder={t.enterGoals}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField('learningGoals', learningGoals)}
                        disabled={savingField === 'learningGoals'}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {savingField === 'learningGoals' ? '...' : t.save}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('learningGoals')}
                        disabled={savingField === 'learningGoals'}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{learningGoals || t.notSet}</p>
                )}
                {fieldErrors.learningGoals && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.learningGoals}</p>
                )}
                {fieldSuccess.learningGoals && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
              </div>

              {/* Daily Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t.dailyGoal}
                  </label>
                  {editingField !== 'dailyGoal' && (
                    <button
                      onClick={() => setEditingField('dailyGoal')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'dailyGoal' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={dailyGoal}
                        onChange={(e) => setDailyGoal(parseInt(e.target.value) || 10)}
                        min="1"
                        max="100"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        autoFocus
                      />
                      <span className="text-gray-600">{t.wordsPerDay}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField('dailyGoal', dailyGoal)}
                        disabled={savingField === 'dailyGoal'}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {savingField === 'dailyGoal' ? '...' : t.save}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('dailyGoal')}
                        disabled={savingField === 'dailyGoal'}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{dailyGoal} {t.wordsPerDay}</p>
                )}
                {fieldErrors.dailyGoal && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.dailyGoal}</p>
                )}
                {fieldSuccess.dailyGoal && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
              </div>

              {/* Notifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    {t.notifications}
                  </label>
                  {editingField !== 'notificationEnabled' && (
                    <button
                      onClick={() => setEditingField('notificationEnabled')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'notificationEnabled' ? (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationEnabled}
                        onChange={(e) => setNotificationEnabled(e.target.checked)}
                        className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                      />
                      <span className="text-gray-700">{notificationEnabled ? t.enabled : t.disabled}</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField('notificationEnabled', notificationEnabled)}
                        disabled={savingField === 'notificationEnabled'}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {savingField === 'notificationEnabled' ? '...' : t.save}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('notificationEnabled')}
                        disabled={savingField === 'notificationEnabled'}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{notificationEnabled ? t.enabled : t.disabled}</p>
                )}
                {fieldErrors.notificationEnabled && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.notificationEnabled}</p>
                )}
                {fieldSuccess.notificationEnabled && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
              </div>

              {/* Theme */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {t.theme}
                  </label>
                  {editingField !== 'theme' && (
                    <button
                      onClick={() => setEditingField('theme')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title={t.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingField === 'theme' ? (
                  <div className="space-y-2">
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value="light">{t.light}</option>
                      <option value="dark">{t.dark}</option>
                      <option value="auto">{t.auto}</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveField('theme', theme)}
                        disabled={savingField === 'theme'}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {savingField === 'theme' ? '...' : t.save}
                      </button>
                      <button
                        onClick={() => handleCancelEdit('theme')}
                        disabled={savingField === 'theme'}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">
                    {theme === 'light' ? t.light : theme === 'dark' ? t.dark : t.auto}
                  </p>
                )}
                {fieldErrors.theme && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.theme}</p>
                )}
                {fieldSuccess.theme && (
                  <p className="text-sm text-green-600 mt-1">{t.saveSuccess}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
