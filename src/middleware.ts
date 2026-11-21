import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about(.*)",
  "/jobs(.*)",
  "/candidates(.*)",
  "/companies(.*)",
  "/market(.*)",
  "/education(.*)",
  "/search(.*)",
  "/post(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/sign-in(.*)",
  "/register(.*)",
  "/create(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/api/maps(.*)",
  "/api/profile/check-username(.*)",
  "/ads.txt",
  "/program(.*)",
  "/finder(.*)",
]);

// API routes that authenticate themselves inside the handler
const isSelfAuthApi = createRouteMatcher([
  "/api/profile/save(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  const isApi = path.startsWith("/api/");

  if (isSelfAuthApi(req)) {
    // Let the route handler call auth() — supports cookie + Bearer token
    const res = NextResponse.next();
    res.headers.set("x-pathname", path);
    return res;
  }

  if (!isPublicRoute(req)) {
    const session = await auth();

    if (isApi) {
      if (!session.userId) {
        return NextResponse.json(
          { error: "Unauthorized. Please sign in again." },
          { status: 401 }
        );
      }
    } else if (!session.userId) {
      const signInUrl = new URL("/sign-in", req.url);
      if (path && path !== "/sign-in") {
        signInUrl.searchParams.set("redirect_url", path);
      }
      return NextResponse.redirect(signInUrl);
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", path);
  return res;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
