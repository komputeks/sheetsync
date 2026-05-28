import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /@username/slug to /s/username/slug
  if (pathname.startsWith('/@')) {
    const parts = pathname.slice(2).split('/');
    if (parts.length >= 2) {
      const url = request.nextUrl.clone();
      url.pathname = `/s/${parts[0]}/${parts[1]}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
