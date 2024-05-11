import Cookies from 'js-cookie';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = Cookies.get('user_id');
  console.log(sessionId);
  console.log(request.nextUrl.pathname);
  
  if (request.nextUrl.pathname.startsWith('/kitchen') && sessionId==sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/cart') && !sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/kitchen', '/cart']
};
