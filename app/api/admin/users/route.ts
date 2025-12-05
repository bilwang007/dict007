import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getAdminClient } from '@/app/lib/supabase/admin'

// GET: Get all users (admin only)
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

    // Try to use admin client to get auth users
    let authUsers: any[] = []
    try {
      const adminSupabase = getAdminClient()
      const { data: authData } = await adminSupabase.auth.admin.listUsers()
      authUsers = authData?.users || []
    } catch (error) {
      console.warn('Could not fetch auth users (service role key may not be set):', error)
    }

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, role, full_name, created_at')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Create map of auth users by ID
    const authUserMap = new Map(authUsers.map(u => [u.id, u]))
    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    // Combine auth users with profiles
    const allUserIds = new Set([...authUsers.map(u => u.id), ...(profiles || []).map(p => p.id)])
    const users = Array.from(allUserIds).map(userId => {
      const authUser = authUserMap.get(userId)
      const profile = profileMap.get(userId)
      
      return {
        id: userId,
        email: authUser?.email || profile?.email || 'N/A',
        created_at: authUser?.created_at || profile?.created_at || new Date().toISOString(),
        last_sign_in_at: authUser?.last_sign_in_at || null,
        role: profile?.role || 'user',
        full_name: profile?.full_name || null,
      }
    })

    return NextResponse.json({
      users: users.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    })
  } catch (error: any) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

