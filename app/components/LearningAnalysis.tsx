'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, BookOpen } from 'lucide-react'
import { getNotebookEntries } from '../lib/storage-supabase'
import type { NotebookEntry } from '../lib/types'

export default function LearningAnalysis() {
  const [stats, setStats] = useState({
    today: 0,
    last7Days: 0,
    last30Days: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const entries = await getNotebookEntries()
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const todayCount = entries.filter(e => {
          const entryDate = new Date(e.firstLearnedDate || e.createdAt)
          return entryDate >= today
        }).length

        const last7DaysCount = entries.filter(e => {
          const entryDate = new Date(e.firstLearnedDate || e.createdAt)
          return entryDate >= sevenDaysAgo
        }).length

        const last30DaysCount = entries.filter(e => {
          const entryDate = new Date(e.firstLearnedDate || e.createdAt)
          return entryDate >= thirtyDaysAgo
        }).length

        setStats({
          today: todayCount,
          last7Days: last7DaysCount,
          last30Days: last30DaysCount,
          total: entries.length,
        })
      } catch (error) {
        console.error('Error loading learning stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()

    // Refresh when notebook is updated
    const handleNotebookUpdate = () => {
      loadStats()
    }
    window.addEventListener('notebookUpdated', handleNotebookUpdate)
    return () => window.removeEventListener('notebookUpdated', handleNotebookUpdate)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">Learning Analysis</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Today</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.today}</p>
          <p className="text-xs text-blue-600 mt-1">words learned</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Last 7 Days</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.last7Days}</p>
          <p className="text-xs text-green-600 mt-1">words learned</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Last 30 Days</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.last30Days}</p>
          <p className="text-xs text-purple-600 mt-1">words learned</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Words in Notebook</span>
          <span className="text-lg font-semibold text-gray-900">{stats.total}</span>
        </div>
      </div>
    </div>
  )
}

