import { NextResponse } from "next/server";
import { verifyUserPassword, updateLastLogin } from "@/lib/supabaseDb";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "9router-default-secret-change-me"
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Use email or username as identifier
    const identifier = email || username;
    
    if (!identifier) {
      return NextResponse.json(
        { error: "Email or username is required" },
        { status: 400 }
      );
    }

    // Verify user credentials
    const user = await verifyUserPassword(identifier, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is disabled. Please contact administrator." },
        { status: 403 }
      );
    }

    // Update last login timestamp
    await updateLastLogin(user.id);

    // Determine cookie security
    const forceSecureCookie = process.env.AUTH_COOKIE_SECURE === "true";
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const isHttpsRequest = forwardedProto === "https";
    const useSecureCookie = forceSecureCookie || isHttpsRequest;

    // Create JWT token with user info
    const token = await new SignJWT({
      authenticated: true,
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(SECRET);

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Login API] Error:", error);
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
