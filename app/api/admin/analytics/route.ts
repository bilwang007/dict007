import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// GET: Get analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // For now, return basic analytics
    // In the future, you can add a search_logs table to track searches
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Get unique users count
    const { count: uniqueUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Get total word definitions (as proxy for searches)
    const { count: totalWords } = await supabase
      .from('word_definitions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    // For now, return placeholder data
    // TODO: Implement search_logs table to track actual searches
    return NextResponse.json({
      totalSearches: totalWords || 0, // Placeholder
      uniqueUsers: uniqueUsers || 0,
      searchesToday: 0, // Placeholder - implement with search_logs
      searchesThisWeek: 0, // Placeholder - implement with search_logs
      topWords: [], // Placeholder - implement with search_logs
      searchesByDay: [], // Placeholder - implement with search_logs
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

