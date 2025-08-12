import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  
  // Canonicalize battery-chargers URL variations
  if (url.pathname === "/Battery-Chargers" || url.pathname === "/battery-chargers/") {
    url.pathname = "/battery-chargers";
    return NextResponse.redirect(url.toString(), 308);
  }
  
  // Remove trailing slashes from other pages (except root)
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url.toString(), 308);
  }
  
  return NextResponse.next();
}

export const config = { 
  matcher: [
    "/Battery-Chargers", 
    "/battery-chargers/",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ] 
};