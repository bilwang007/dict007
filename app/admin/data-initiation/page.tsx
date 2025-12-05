'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertCircle, Download } from 'lucide-react'
import Navigation from '@/app/components/Navigation'
import { createClient } from '@/app/lib/supabase/client'

interface UploadProgress {
  current: number
  total: number
  success: number
  failed: number
  currentWord?: string
}

export default function DataInitiationPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [nativeLanguage, setNativeLanguage] = useState('zh')
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login?redirect=/admin/data-initiation')
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
    setLoading(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
        alert('Please select a JSON file')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    setProgress({ current: 0, total: 0, success: 0, failed: 0 })
    setLog([])

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Validate format
      if (!Array.isArray(data)) {
        throw new Error('JSON file must contain an array of word definitions')
      }

      setProgress({ current: 0, total: data.length, success: 0, failed: 0 })
      addLog(`Starting upload of ${data.length} word definitions...`)

      let successCount = 0
      let failedCount = 0

      // Process in batches to avoid overwhelming the API
      const batchSize = 10
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(async (item: any, index: number) => {
            const wordIndex = i + index
            const word = item.word || item.Word || item.text
            
            if (!word) {
              failedCount++
              addLog(`❌ Item ${wordIndex + 1}: Missing word field`)
              return
            }

            try {
              setProgress({
                current: wordIndex + 1,
                total: data.length,
                success: successCount,
                failed: failedCount,
                currentWord: word,
              })

              const response = await fetch('/api/admin/bulk-upload-words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  word,
                  targetLanguage,
                  nativeLanguage,
                  definitionTarget: item.definitionTarget || item.definition_target || item.definition || '',
                  definition: item.definition || item.definition_native || '',
                  exampleSentence1: item.exampleSentence1 || item.example_sentence_1 || item.examples?.[0]?.sentence || '',
                  exampleSentence2: item.exampleSentence2 || item.example_sentence_2 || item.examples?.[1]?.sentence || '',
                  exampleTranslation1: item.exampleTranslation1 || item.example_translation_1 || item.examples?.[0]?.translation || '',
                  exampleTranslation2: item.exampleTranslation2 || item.example_translation_2 || item.examples?.[1]?.translation || '',
                  usageNote: item.usageNote || item.usage_note || '',
                  isValidWord: item.isValidWord !== undefined ? item.isValidWord : true,
                  suggestedWord: item.suggestedWord || item.suggested_word || null,
                }),
              })

              if (response.ok) {
                successCount++
                addLog(`✅ ${wordIndex + 1}/${data.length}: "${word}" uploaded`)
              } else {
                failedCount++
                const error = await response.json().catch(() => ({ error: 'Unknown error' }))
                addLog(`❌ ${wordIndex + 1}/${data.length}: "${word}" - ${error.error || 'Failed'}`)
              }
            } catch (error: any) {
              failedCount++
              addLog(`❌ ${wordIndex + 1}/${data.length}: "${word}" - ${error.message || 'Error'}`)
            }
          })
        )

        // Update progress
        setProgress({
          current: Math.min(i + batchSize, data.length),
          total: data.length,
          success: successCount,
          failed: failedCount,
        })

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      addLog(`\n✅ Upload complete! Success: ${successCount}, Failed: ${failedCount}`)
      setProgress({
        current: data.length,
        total: data.length,
        success: successCount,
        failed: failedCount,
      })
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const downloadTemplate = () => {
    const template = [
      {
        word: 'hello',
        definitionTarget: 'A greeting used when meeting someone',
        definition: '见面时的问候语',
        exampleSentence1: 'Hello, how are you?',
        exampleTranslation1: '你好，你好吗？',
        exampleSentence2: 'She said hello to everyone',
        exampleTranslation2: '她向每个人问好',
        usageNote: 'Common greeting, very friendly',
        isValidWord: true,
      },
      {
        word: 'world',
        definitionTarget: 'The earth and all its inhabitants',
        definition: '地球及其所有居民',
        exampleSentence1: 'The world is beautiful',
        exampleTranslation1: '世界是美丽的',
        exampleSentence2: 'People from around the world',
        exampleTranslation2: '来自世界各地的人们',
        usageNote: 'Refers to the entire planet',
        isValidWord: true,
      },
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-definitions-template.json'
    a.click()
    URL.revokeObjectURL(url)
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
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Navigation />

        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent mb-2">
                Data Initiation
              </h1>
              <p className="text-gray-600">Bulk upload word definitions to the database</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Language Selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Language Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="zh">Chinese</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="pt">Portuguese</option>
                  <option value="bn">Bengali</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Native Language</label>
                <select
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="zh">Chinese</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="pt">Portuguese</option>
                  <option value="bn">Bengali</option>
                  <option value="ru">Russian</option>
                  <option value="ja">Japanese</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Upload Word Definitions</h3>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select JSON file with word definitions
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={uploading}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Definitions</span>
                  </>
                )}
              </button>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Upload Progress</h3>
                <span className="text-sm text-gray-600">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {progress.success} success
                  </span>
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {progress.failed} failed
                  </span>
                </div>
                {progress.currentWord && (
                  <span className="text-gray-600">Processing: {progress.currentWord}</span>
                )}
              </div>
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Upload Log</h3>
              <div className="bg-black rounded p-4 h-64 overflow-y-auto font-mono text-sm">
                {log.map((line, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Instructions</h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Download the template to see the expected JSON format</li>
                  <li>Each word definition should include: word, definitionTarget, definition, examples, usageNote</li>
                  <li>Words will be automatically approved and available to all users</li>
                  <li>Duplicate words will be skipped (based on word + language combination)</li>
                  <li>Recommended: Upload 2000 common words for fast database lookups</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

