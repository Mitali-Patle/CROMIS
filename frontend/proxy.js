import { NextResponse } from "next/server";

export default function middleware(request) {
  const url = new URL(request.url);
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // Student protection
  if (url.pathname.startsWith("/student")) {
    if (!token || role !== "student") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Faculty protection
  if (url.pathname.startsWith("/faculty")) {
    if (!token || role !== "faculty") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Admin protection
  if (url.pathname.startsWith("/admin")) {
    if (!token || role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*"],
};
