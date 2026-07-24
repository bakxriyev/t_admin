import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tashkentlaw.ilmify-edu.uz";

const NEXT_AUTH_ROUTES = [
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/session",
  "/api/auth/csrf",
  "/api/auth/callback",
  "/api/auth/error",
  "/api/auth/providers",
  "/api/auth/_log",
  "/api/auth/verify-request",
];

const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "content-length",
];

function isNextAuthRoute(pathname: string): boolean {
  return NEXT_AUTH_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?")
  );
}

async function proxyToBackend(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const backendUrl = `${API_URL}${pathname}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host") {
      headers.set("host", new URL(API_URL).host);
    } else if (!HOP_BY_HOP_HEADERS.includes(lower)) {
      headers.set(key, value);
    }
  });

  try {
    const body = req.method !== "GET" && req.method !== "HEAD" && req.body
      ? req.body
      : null;

    const proxyRes = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body as BodyInit | null,
      // @ts-ignore — duplex is required when body is a ReadableStream
      duplex: "half",
    });

    const responseHeaders = new Headers();
    proxyRes.headers.forEach((value, key) => {
      if (!["connection", "keep-alive", "transfer-encoding"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(proxyRes.body, {
      status: proxyRes.status,
      statusText: proxyRes.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ message: "Proxy error" }, { status: 502 });
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const isApi = pathname.startsWith("/api/");
  const isUploads = pathname.startsWith("/uploads");
  const isPublic = pathname.startsWith("/_next") || pathname === "/favicon.ico" || isUploads;

  if (isPublic) {
    return NextResponse.next();
  }

  if (isApi) {
    if (isNextAuthRoute(pathname)) {
      return NextResponse.next();
    }
    return proxyToBackend(req);
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    if (isAuth && !searchParams.has("expired")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
