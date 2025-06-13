import { type NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";
import {
  securityMiddleware,
  addSecurityHeaders,
} from "./src/lib/security/middleware";

export async function middleware(request: NextRequest) {
  // 1. Apply security middleware first
  const securityResponse = await securityMiddleware(request);
  if (securityResponse) {
    return securityResponse;
  }

  // 2. Apply Supabase session middleware
  const response = await updateSession(request);

  // 3. Add security headers to response
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
