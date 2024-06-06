import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

let locales = ['en-US', 'es-ES'];

// Get the preferred locale
function getLocale(request) {
  let { headers } = request;
  let languages = new Negotiator({ headers }).languages();
  let defaultLocale = 'en-US';

  let locale;

  try {
    locale = match(languages, locales, defaultLocale); // -> 'en-US'
  } catch (error) {
    locale = defaultLocale;
  }

  return locale;
}
  
export function middleware(request) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

  if (pathnameHasLocale) return
  
  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};