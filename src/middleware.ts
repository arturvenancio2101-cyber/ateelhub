import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;
    
    const isAuth = !!req.nextauth.token;
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Proteger rotas restritas para ADMIN
    // "ADMIN -> acesso irrestrito (financeiro, gerenciamento de estoque, usuários e configurações)"
    if (path.startsWith('/dashboard') || path.startsWith('/products') || path.startsWith('/suppliers')) {
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/orders', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/orders/:path*', '/inventory/:path*', '/kits/:path*', '/products/:path*', '/suppliers/:path*', '/ideas/:path*']
}
