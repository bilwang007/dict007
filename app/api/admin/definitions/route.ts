import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

// GET: Get pending definitions for admin review
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Get definitions with creator info
    const { data: definitions, error } = await supabase
      .from('word_definitions')
      .select(`
        *,
        creator:user_profiles!word_definitions_created_by_fkey(id, email, full_name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching definitions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch definitions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      definitions: definitions || [],
    })
  } catch (error: any) {
    console.error('Admin definitions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Approve or reject a definition
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

    const body = await request.json()
    const { definitionId, action } = body // action: 'approve' or 'reject'

    if (!definitionId || !action) {
      return NextResponse.json(
        { error: 'definitionId and action are required' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // If approving, check if there's already an approved definition for this word
      const { data: definition } = await supabase
        .from('word_definitions')
        .select('word, target_language, native_language')
        .eq('id', definitionId)
        .single()

      if (definition) {
        // Reject other pending definitions for the same word
        await supabase
          .from('word_definitions')
          .update({ status: 'rejected' })
          .eq('word', definition.word)
          .eq('target_language', definition.target_language)
          .eq('native_language', definition.native_language)
          .eq('status', 'pending')
          .neq('id', definitionId)

        // Approve this definition
        const { data, error } = await supabase
          .from('word_definitions')
          .update({
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', definitionId)
          .select()
          .single()

        if (error) {
          console.error('Error approving definition:', error)
          return NextResponse.json(
            { error: 'Failed to approve definition' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          definition: data,
        })
      }
    } else if (action === 'reject') {
      const { data, error } = await supabase
        .from('word_definitions')
        .update({
          status: 'rejected',
          approved_by: user.id,
        })
        .eq('id', definitionId)
        .select()
        .single()

      if (error) {
        console.error('Error rejecting definition:', error)
        return NextResponse.json(
          { error: 'Failed to reject definition' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        definition: data,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Admin approve/reject error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

