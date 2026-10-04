import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// Logged-in users only.
const PROTECTED_ROUTES = ["/dashboard", "/foods", "/meals", "/log", "/settings"];

// Logged-out visitors only.
const GUEST_ONLY_ROUTES = ["/", "/login", "/register"];

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!userId && isProtected(pathname)) {
    return redirectTo("/login", request, response);
  }

  if (userId && GUEST_ONLY_ROUTES.includes(pathname)) {
    return redirectTo("/dashboard", request, response);
  }

  return response;
}

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function redirectTo(path: string, request: NextRequest, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.url));

  // Keep refreshed session cookies.
  for (const cookie of sessionResponse.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }

  return redirect;
}

export const config = {
  // Skip static files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
