'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Users, BarChart3, FileText, Loader2, AlertCircle } from 'lucide-react'
import Navigation from '@/app/components/Navigation'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWords: 0,
    totalUsers: 0,
    pendingDefinitions: 0,
    totalSearches: 0,
  })

  useEffect(() => {
    checkAdminAndLoadStats()
  }, [])

  const checkAdminAndLoadStats = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/admin')
      return
    }

    // Check if user is admin
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
    await loadStats()
    setLoading(false)
  }

  const loadStats = async () => {
    const supabase = createClient()
    
    try {
      // Get total words (handle case where table doesn't exist)
      let wordCount = 0
      let pendingCount = 0
      try {
        const { count } = await supabase
          .from('word_definitions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
        wordCount = count || 0

        const { count: pending } = await supabase
          .from('word_definitions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        pendingCount = pending || 0
      } catch (wordError: any) {
        // Table might not exist yet - that's okay
        if (wordError.code !== '42P01') { // 42P01 = relation does not exist
          console.warn('Error loading word stats:', wordError)
        }
      }

      // Get total users
      let userCount = 0
      try {
        const { count } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
        userCount = count || 0
      } catch (userError) {
        console.warn('Error loading user stats:', userError)
      }

      setStats({
        totalWords: wordCount,
        totalUsers: userCount,
        pendingDefinitions: pendingCount,
        totalSearches: 0, // Will be implemented with analytics
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Navigation />
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return null // Will redirect
  }

  const adminTools = [
    {
      title: 'Data Initiation',
      description: 'Bulk upload word definitions (e.g., 2000 common words)',
      icon: Database,
      href: '/admin/data-initiation',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Review Definitions',
      description: 'Approve or reject pending word definitions',
      icon: FileText,
      href: '/admin/definitions',
      color: 'from-purple-500 to-pink-500',
      badge: stats.pendingDefinitions > 0 ? stats.pendingDefinitions : undefined,
    },
    {
      title: 'User Management',
      description: 'View users, login status, and manage accounts',
      icon: Users,
      href: '/admin/users',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Analytics & Traffic',
      description: 'Track searches, traffic, and user activity',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Navigation />

        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mt-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-6">Manage the dictionary system and users</p>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{stats.totalWords.toLocaleString()}</div>
              <div className="text-sm text-blue-600">Total Words</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-green-600">Total Users</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{stats.pendingDefinitions}</div>
              <div className="text-sm text-purple-600">Pending Reviews</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{stats.totalSearches.toLocaleString()}</div>
              <div className="text-sm text-orange-600">Total Searches</div>
            </div>
          </div>

          {/* Admin Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {adminTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group relative bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-gray-200 hover:border-green-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{tool.title}</h3>
                        {tool.badge && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{tool.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 text-gray-400 group-hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

