import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Not logged in -> login
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Volunteer trying to open organizer pages
  if (pathname.startsWith("/organizer") && token.role !== "organizer") {
    return NextResponse.redirect(new URL("/volunteer/dashboard", req.url));
  }

  // Organizer trying to open volunteer pages
  if (pathname.startsWith("/volunteer") && token.role !== "volunteer") {
    return NextResponse.redirect(new URL("/organizer/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/organizer/:path*", "/volunteer/:path*"],
};