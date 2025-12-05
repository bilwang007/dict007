'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, Search, LogIn, LogOut, User } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      console.log('🔍 Navigation: Checking session...', { hasSession: !!session, error: sessionError })
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        setLoading(false)
        return
      }
      
      setUser(session?.user ?? null)
      console.log('👤 Navigation: User set:', session?.user?.email || 'null')
      
      // Check if user is admin
      if (session?.user) {
        try {
          console.log('🔍 Navigation: Fetching profile for user:', session.user.id)
          console.log('⏳ Starting Supabase query (initial)...')
          
          // Use a shorter timeout and simpler query
          const queryPromise = supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle() // Use maybeSingle instead of single to avoid errors if not found
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout after 3 seconds')), 3000)
          )
          
          let profile, profileError
          try {
            const result = await Promise.race([queryPromise, timeoutPromise])
            profile = (result as any)?.data
            profileError = (result as any)?.error
          } catch (error: any) {
            console.warn('⚠️ Profile query timeout or error (initial):', error.message)
            profileError = { message: error.message || 'Query failed', code: 'TIMEOUT' }
            profile = null
            // Don't set isAdmin on timeout - fail gracefully
            setIsAdmin(false)
            setLoading(false)
            return
          }
          
          console.log('📊 Query completed (initial)!')
          console.log('📊 Navigation: Profile result:', { profile, error: profileError })
          console.log('📊 Profile data:', profile)
          console.log('📊 Error object:', profileError)
          
          if (profileError) {
            console.error('❌ Profile fetch error:', profileError)
            console.error('❌ Error details:', {
              message: profileError.message,
              code: profileError.code,
              details: profileError.details,
              hint: profileError.hint
            })
            console.error('❌ Full error object:', JSON.stringify(profileError, null, 2))
            // If profile doesn't exist, create it
            if (profileError.code === 'PGRST116') {
              console.log('➕ Creating missing profile...')
              const { error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  role: 'user'
                })
              
              if (insertError) {
                console.error('❌ Failed to create profile:', insertError)
              } else {
                console.log('✅ Profile created successfully')
              }
            }
            setIsAdmin(false)
          } else {
            const adminStatus = profile?.role === 'admin'
            setIsAdmin(adminStatus)
            console.log('✅ Admin status:', adminStatus, '| Role:', profile?.role || 'null')
          }
        } catch (error) {
          console.error('❌ Error checking admin status:', error)
          setIsAdmin(false)
        }
      } else {
        console.log('ℹ️ No session, user not logged in')
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Navigation: Auth state changed:', event, 'User:', session?.user?.email || 'null')
      setUser(session?.user ?? null)
      
      // Check if user is admin
      if (session?.user) {
        try {
          console.log('🔍 Navigation: Fetching profile on auth change...')
          console.log('🔍 User ID:', session.user.id)
          console.log('🔍 User Email:', session.user.email)
          
          console.log('⏳ Starting Supabase query...')
          console.log('⏳ Query details: SELECT role FROM user_profiles WHERE id =', session.user.id)
          
          // Use a shorter timeout and simpler query
          const queryPromise = supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle() // Use maybeSingle instead of single to avoid errors if not found
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout after 3 seconds')), 3000)
          )
          
          let profile, profileError
          try {
            const result = await Promise.race([queryPromise, timeoutPromise])
            profile = (result as any)?.data
            profileError = (result as any)?.error
          } catch (error: any) {
            console.warn('⚠️ Profile query timeout or error:', error.message)
            profileError = { message: error.message || 'Query failed', code: 'TIMEOUT' }
            profile = null
            // Don't set isAdmin on timeout - fail gracefully
            setIsAdmin(false)
            return
          }
          
          console.log('📊 Query completed!')
          console.log('📊 Raw profile response:', { profile, error: profileError })
          console.log('📊 Profile data:', profile)
          console.log('📊 Error object:', profileError)
          
          if (profileError) {
            console.error('❌ Profile fetch error on auth change:', profileError)
            console.error('❌ Full error object:', JSON.stringify(profileError, null, 2))
            console.error('❌ Error code:', profileError.code)
            console.error('❌ Error message:', profileError.message)
            console.error('❌ Error details:', profileError.details)
            console.error('❌ Error hint:', profileError.hint)
            setIsAdmin(false)
          } else if (profile) {
            const adminStatus = profile?.role === 'admin'
            setIsAdmin(adminStatus)
            console.log('✅ Admin status updated:', adminStatus, '| Role:', profile?.role || 'null')
            console.log('✅ Full profile data:', JSON.stringify(profile, null, 2))
          } else {
            console.warn('⚠️ No profile data and no error - setting isAdmin to false')
            setIsAdmin(false)
          }
        } catch (error: any) {
          console.error('❌ Error checking admin status on auth change:', error)
          console.error('❌ Exception details:', JSON.stringify(error, null, 2))
          setIsAdmin(false)
        }
      } else {
        console.log('ℹ️ No session on auth change')
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/', label: 'Lookup', icon: Search },
    { href: '/notebook', label: 'Notebook', icon: BookOpen },
    { href: '/study', label: 'Study', icon: GraduationCap },
  ]

  const handleLookupClick = (e: React.MouseEvent) => {
    // If already on lookup page, scroll to top and trigger reset
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Dispatch custom event to reset the page
      window.dispatchEvent(new CustomEvent('resetLookupPage'))
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isLookup = item.href === '/'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isLookup ? handleLookupClick : undefined}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                    title="Admin Dashboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  title={user.email || 'Profile'}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline truncate max-w-[120px]">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

