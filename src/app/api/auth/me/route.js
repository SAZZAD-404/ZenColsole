import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getUserById } from "@/lib/supabaseDb";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "9router-default-secret-change-me"
);

/**
 * Get Current User API
 * GET /api/auth/me
 * Returns current logged-in user information from JWT token
 */
export async function GET() {
  try {
    // Get JWT token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify and decode JWT
    const { payload } = await jwtVerify(token, SECRET);

    if (!payload.userId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await getUserById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user info
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: user.last_login_at,
      },
    });
  } catch (error) {
    console.error("[Me API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get user information" },
      { status: 500 }
    );
  }
}
