'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, LogOut, Save, Edit2, Globe, Target, Bell, Palette } from 'lucide-react'
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
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [uiLanguage, setUiLanguage] = useState<'en' | 'zh'>('en')
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [learningGoals, setLearningGoals] = useState('')
  const [dailyGoal, setDailyGoal] = useState(10)
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')

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
          setUiLanguage(p.ui_language || 'en')
          setPreferredLanguages(p.preferred_languages || [])
          setLearningGoals(p.learning_goals || '')
          setDailyGoal(p.daily_goal || 10)
          setNotificationEnabled(p.notification_enabled !== false)
          setTheme(p.theme || 'light')
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          bio,
          uiLanguage,
          preferredLanguages,
          learningGoals,
          dailyGoal,
          notificationEnabled,
          theme,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setIsEditing(false)
        alert(t.saveSuccess)
        fetchProfile(user.id)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert(t.saveError)
    } finally {
      setSaving(false)
    }
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
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                {t.editProfile}
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* User Info Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl sm:text-3xl font-bold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullName}
                    className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    {fullName || user.email?.split('@')[0] || 'User'}
                  </h2>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.bio}
                </label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t.enterBio}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900">{bio || t.notSet}</p>
                )}
              </div>

              {/* UI Language */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t.uiLanguage}
                </label>
                {isEditing ? (
                  <select
                    value={uiLanguage}
                    onChange={(e) => setUiLanguage(e.target.value as 'en' | 'zh')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="zh">简体中文</option>
                  </select>
                ) : (
                  <p className="text-base text-gray-900">{uiLanguage === 'en' ? 'English' : '简体中文'}</p>
                )}
              </div>

              {/* Preferred Languages */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.preferredLanguages}
                </label>
                {isEditing ? (
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
              </div>

              {/* Learning Goals */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {t.learningGoals}
                </label>
                {isEditing ? (
                  <textarea
                    value={learningGoals}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    placeholder={t.enterGoals}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900">{learningGoals || t.notSet}</p>
                )}
              </div>

              {/* Daily Goal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.dailyGoal}
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(parseInt(e.target.value) || 10)}
                      min="1"
                      max="100"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                    <span className="text-gray-600">{t.wordsPerDay}</span>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{dailyGoal} {t.wordsPerDay}</p>
                )}
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {t.notifications}
                </label>
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationEnabled}
                      onChange={(e) => setNotificationEnabled(e.target.checked)}
                      className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                    />
                    <span className="text-gray-700">{notificationEnabled ? t.enabled : t.disabled}</span>
                  </label>
                ) : (
                  <p className="text-base text-gray-900">{notificationEnabled ? t.enabled : t.disabled}</p>
                )}
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  {t.theme}
                </label>
                {isEditing ? (
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="light">{t.light}</option>
                    <option value="dark">{t.dark}</option>
                    <option value="auto">{t.auto}</option>
                  </select>
                ) : (
                  <p className="text-base text-gray-900">
                    {theme === 'light' ? t.light : theme === 'dark' ? t.dark : t.auto}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : t.save}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      fetchProfile(user.id) // Reset form
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {t.cancel}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logout}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
