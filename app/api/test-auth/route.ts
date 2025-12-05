import { NextResponse } from 'next/server'

// Simple test endpoint to verify server is running
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
}

