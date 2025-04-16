import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Get user's preferred locale from the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  let locale = defaultLocale;
  
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
    for (const lang of languages) {
      const languageCode = lang.split('-')[0];
      if (locales.includes(languageCode)) {
        locale = languageCode;
        break;
      }
    }
  }

  // Redirect to the same URL but with the locale prefix
  return NextResponse.redirect(
    new URL(
      `/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}${
        request.nextUrl.search
      }`,
      request.url
    )
  );
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};