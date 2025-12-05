// Supabase client for middleware
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Try getSession() first (designed for middleware)
  let {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // If getSession fails but we have auth cookies, try getUser() as fallback
  let user = session?.user ?? null
  if (!user && !sessionError) {
    const userResult = await supabase.auth.getUser()
    user = userResult.data.user
    if (userResult.error && !sessionError) {
      sessionError = userResult.error
    }
  }

  // Log for debugging
  const allCookies = request.cookies.getAll()
  const cookieNames = allCookies.map(c => c.name).join(', ')
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  console.log('🛡️ Middleware: Path:', request.nextUrl.pathname, 'User:', user?.email || 'null', 'HasSession:', !!session, 'SessionError:', sessionError?.message || 'none')
  console.log('   Cookies:', cookieNames || 'none')
  
  // If we have an auth cookie but no session, log the cookie value (first 50 chars) for debugging
  if (authCookie && !session) {
    console.log('   ⚠️ Auth cookie exists but session is null. Cookie value preview:', authCookie.value.substring(0, 50) + '...')
    console.log('   Cookie length:', authCookie.value.length)
  }
  
  // If there's a session error, log it but don't block - let the route handle it
  if (sessionError && sessionError.message !== 'Auth session missing!') {
    console.warn('⚠️ Middleware: Session error (non-critical):', sessionError.message)
  }

  // Protected routes
  const protectedPaths = ['/notebook', '/study', '/admin']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    console.log('🚫 Middleware: Blocking access to protected route, redirecting to login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  
  if (isProtectedPath && user) {
    console.log('✅ Middleware: Allowing access to protected route for:', user.email)
  }

  // Redirect to home if accessing auth pages while logged in
  // BUT preserve redirect parameter if it exists
  if (isAuthPath && user) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    if (redirectParam && protectedPaths.some(path => redirectParam.startsWith(path))) {
      // Redirect to the protected path they were trying to access
      const url = request.nextUrl.clone()
      url.pathname = redirectParam
      url.searchParams.delete('redirect')
      return NextResponse.redirect(url)
    }
    // Default redirect to home if no specific protected redirect
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

