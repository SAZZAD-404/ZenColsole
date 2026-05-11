import { proxy } from "./src/dashboardGuard";

export function middleware(request) {
  return proxy(request);
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/user/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
