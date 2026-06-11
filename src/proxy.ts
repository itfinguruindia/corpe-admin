import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function nextWithPathname(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email-change",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Get token from cookie or you can modify to check localStorage via client-side
  const token = request.cookies.get("accessToken")?.value;

  // If trying to access protected route without token, redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access public route with token (like login/register), redirect to dashboard.
  // Exempt routes that need to work regardless of auth state.
  const authExemptPublicRoutes = [
    "/forgot-password",
    "/reset-password",
    "/verify-email-change",
  ];
  if (
    isPublicRoute &&
    token &&
    !authExemptPublicRoutes.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return nextWithPathname(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
