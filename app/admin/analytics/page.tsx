'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Search, Users, Clock, Loader2 } from 'lucide-react'
import Navigation from '@/app/components/Navigation'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

interface AnalyticsData {
  totalSearches: number
  uniqueUsers: number
  searchesToday: number
  searchesThisWeek: number
  topWords: Array<{ word: string; count: number }>
  searchesByDay: Array<{ date: string; count: number }>
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    checkAdminAndLoadAnalytics()
  }, [])

  const checkAdminAndLoadAnalytics = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/admin/analytics')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    setIsAdmin(true)
    await loadAnalytics()
    setLoading(false)
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Navigation />
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Navigation />

        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Analytics & Traffic
              </h1>
              <p className="text-gray-600">Track searches, traffic, and user activity</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600">Total Searches</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{analytics.totalSearches.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">Unique Users</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">{analytics.uniqueUsers}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-purple-600">Today</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{analytics.searchesToday}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-orange-600">This Week</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">{analytics.searchesThisWeek}</div>
                </div>
              </div>

              {/* Top Words */}
              {analytics.topWords.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Most Searched Words</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {analytics.topWords.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-900">{item.word}</span>
                          </div>
                          <span className="text-gray-600">{item.count} searches</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Searches Chart */}
              {analytics.searchesByDay.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Searches by Day (Last 7 Days)</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {analytics.searchesByDay.map((day, index) => {
                        const maxCount = Math.max(...analytics.searchesByDay.map(d => d.count))
                        return (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700">{day.date}</span>
                              <span className="text-sm font-medium text-gray-900">{day.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${(day.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Analytics data will appear here once tracking is enabled</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

