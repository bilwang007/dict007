import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// GET: Fetch user profile
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

    // Get user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
      createdAt: user.created_at,
      profile: profile || null,
    })
  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      fullName, 
      avatarUrl, 
      preferredLanguages, 
      learningPreferences,
      bio,
      uiLanguage,
      learningGoals,
      dailyGoal,
      notificationEnabled,
      theme
    } = body

    // Update user profile
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (fullName !== undefined) updateData.full_name = fullName
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl
    if (preferredLanguages !== undefined) updateData.preferred_languages = preferredLanguages
    if (learningPreferences !== undefined) updateData.learning_preferences = learningPreferences
    if (bio !== undefined) updateData.bio = bio
    if (uiLanguage !== undefined) updateData.ui_language = uiLanguage
    if (learningGoals !== undefined) updateData.learning_goals = learningGoals
    if (dailyGoal !== undefined) updateData.daily_goal = dailyGoal
    if (notificationEnabled !== undefined) updateData.notification_enabled = notificationEnabled
    if (theme !== undefined) updateData.theme = theme

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        ...updateData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data,
    })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete user account (this will cascade delete all related data due to ON DELETE CASCADE)
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error: any) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

