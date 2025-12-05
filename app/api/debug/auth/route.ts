import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// Debug endpoint to check auth status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    let profile = null
    let profileError = null
    
    if (user) {
      const profileResult = await supabase
        .from('user_profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single()
      
      profile = profileResult.data
      profileError = profileResult.error
    }
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
      } : null,
      authError: authError?.message || null,
      profile: profile,
      profileError: profileError?.message || null,
      isAdmin: profile?.role === 'admin' || false,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 })
  }
}

