import { NextRequest, NextResponse } from 'next/server'
import { generateDefinition } from '@/app/lib/ai'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

interface BatchUploadResult {
  word: string
  success: boolean
  definition?: any
  error?: string
}

async function extractWordsFromFile(file: File): Promise<string[]> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const words: string[] = []
  
  if (extension === 'xlsx' || extension === 'xls') {
    // Excel parsing
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet)
    
    // Try to find word column
    data.forEach((row: any) => {
      const word = row.word || row.Word || row['单词'] || Object.values(row)[0]
      if (word && typeof word === 'string' && word.trim().length > 0) {
        words.push(word.trim())
      }
    })
  } else if (extension === 'csv') {
    // CSV parsing
    const text = await file.text()
    const parsed = Papa.parse(text, { 
      header: true,
      skipEmptyLines: true 
    })
    
    parsed.data.forEach((row: any) => {
      const word = row.word || row.Word || row['单词'] || Object.values(row)[0]
      if (word && typeof word === 'string' && word.trim().length > 0) {
        words.push(word.trim())
      }
    })
  } else {
    // Plain text or markdown - extract words
    const text = await file.text()
    // Remove markdown syntax and extract words
    const cleanText = text
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove code
      .replace(/\n+/g, ' ') // Replace newlines with space
    
    // Split by whitespace and filter
    const extracted = cleanText
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 0 && w.length < 50) // Filter out very long strings
    
    words.push(...extracted)
  }
  
  // Remove duplicates and return
  return [...new Set(words)].slice(0, 100) // Limit to 100 words per batch
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const targetLanguage = formData.get('targetLanguage') as string
    const nativeLanguage = formData.get('nativeLanguage') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!targetLanguage || !nativeLanguage) {
      return NextResponse.json({ error: 'Target and native languages are required' }, { status: 400 })
    }

    // Extract words from file
    const words = await extractWordsFromFile(file)
    
    if (words.length === 0) {
      return NextResponse.json({ error: 'No words found in file' }, { status: 400 })
    }
    
    // Process in batches (to avoid rate limits)
    const results: BatchUploadResult[] = []
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      try {
        const definition = await generateDefinition(word, targetLanguage, nativeLanguage)
        results.push({ 
          word, 
          success: true, 
          definition: {
            ...definition,
            word,
            targetLanguage,
            nativeLanguage
          }
        })
        
        // Add delay to avoid rate limiting (1 second between requests)
        if (i < words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error: any) {
        console.error(`Error processing word "${word}":`, error)
        results.push({ 
          word, 
          success: false, 
          error: error.message || 'Failed to generate definition' 
        })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    return NextResponse.json({ 
      results,
      summary: {
        total: words.length,
        success: successCount,
        failed: failureCount
      }
    })
  } catch (error: any) {
    console.error('Batch upload error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to process batch upload' 
    }, { status: 500 })
  }
}

