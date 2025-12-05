import { NextRequest, NextResponse } from 'next/server'

// This API route is kept for compatibility but flashcards are now client-side only
// Flashcard data comes from localStorage notebook entries

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Flashcards are now client-side only. Use localStorage.',
    flashcards: []
  })
}