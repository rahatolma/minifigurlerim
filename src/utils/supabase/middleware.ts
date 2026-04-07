import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing)

export async function updateSession(request: NextRequest) {
  const isAdminOrApi = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/api') || 
    request.nextUrl.pathname.startsWith('/uploads')

  let supabaseResponse = isAdminOrApi 
    ? NextResponse.next({ request }) 
    : handleI18nRouting(request)

  try {
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
      console.error('Middleware Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.')
      return supabaseResponse;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Middleware Supabase Auth Error:', error.message)
    }

    if (
      !user &&
      request.nextUrl.pathname.match(/^\/(tr|en)\/admin/) &&
      !request.nextUrl.pathname.match(/^\/(tr|en)\/admin\/login/)
    ) {
      // no user, potentially respond by redirecting the user to the login page
      // GEÇİCİ İPTAL: Kullanıcının yerelde geliştirme yapabilmesi için şifre duvarı (middleware redirect) kapatıldı.
      // const url = request.nextUrl.clone()
      // url.pathname = `/${request.nextUrl.pathname.split('/')[1]}/admin/login`
      // return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware Exception:', error)
    // If anything fails in the middleware logic, just return the response
    // to prevent the entire site from crashing with a 500: INTERNAL_SERVER_ERROR
    return supabaseResponse
  }
}

