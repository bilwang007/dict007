'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import { createClient } from '@/app/lib/supabase/client'

interface Definition {
  id: string
  word: string
  target_language: string
  native_language: string
  definition_target: string
  definition: string
  example_sentence_1: string
  example_sentence_2: string
  example_translation_1: string
  example_translation_2: string
  usage_note: string
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  created_at: string
  creator?: {
    email: string
    full_name: string
  }
}

export default function AdminDefinitionsPage() {
  const router = useRouter()
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  const checkAdminAndLoad = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/admin/definitions')
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
    loadPendingDefinitions()
  }

  const loadPendingDefinitions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/definitions?status=pending')
      if (response.ok) {
        const data = await response.json()
        setDefinitions(data.definitions || [])
      }
    } catch (error) {
      console.error('Error loading definitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (definitionId: string) => {
    setProcessing(definitionId)
    try {
      const response = await fetch('/api/admin/definitions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionId, action: 'approve' }),
      })

      if (response.ok) {
        // Remove from list
        setDefinitions(definitions.filter(d => d.id !== definitionId))
      }
    } catch (error) {
      console.error('Error approving:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (definitionId: string) => {
    setProcessing(definitionId)
    try {
      const response = await fetch('/api/admin/definitions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definitionId, action: 'reject' }),
      })

      if (response.ok) {
        // Remove from list
        setDefinitions(definitions.filter(d => d.id !== definitionId))
      }
    } catch (error) {
      console.error('Error rejecting:', error)
    } finally {
      setProcessing(null)
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Navigation />
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Navigation />

        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Admin: Review Definitions
            </h1>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading pending definitions...</p>
            </div>
          ) : definitions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg text-gray-600">No pending definitions to review</p>
            </div>
          ) : (
            <div className="space-y-6">
              {definitions.map((def) => (
                <div
                  key={def.id}
                  className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                        {def.word}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {def.target_language} → {def.native_language}
                      </p>
                      {def.creator && (
                        <p className="text-xs text-gray-500 mt-1">
                          Proposed by: {def.creator.full_name || def.creator.email}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(def.id)}
                        disabled={processing === def.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {processing === def.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(def.id)}
                        disabled={processing === def.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Definition (Target)</h4>
                      <p className="text-gray-900">{def.definition_target}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Definition (Native)</h4>
                      <p className="text-gray-900">{def.definition}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Examples</h4>
                      <div className="space-y-2">
                        <p className="text-gray-800">
                          <span className="font-medium">{def.example_sentence_1}</span>
                          <span className="text-gray-600 italic ml-2">— {def.example_translation_1}</span>
                        </p>
                        <p className="text-gray-800">
                          <span className="font-medium">{def.example_sentence_2}</span>
                          <span className="text-gray-600 italic ml-2">— {def.example_translation_2}</span>
                        </p>
                      </div>
                    </div>
                    {def.usage_note && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Usage Note</h4>
                        <p className="text-gray-700">{def.usage_note}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

