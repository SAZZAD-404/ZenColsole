import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Logout API - Clears authentication cookie
 * POST /api/auth/logout
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Delete auth token cookie
    cookieStore.delete("auth_token");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[Logout API] Error:", error);
    
    // Even if there's an error, try to delete the cookie
    try {
      const cookieStore = await cookies();
      cookieStore.delete("auth_token");
    } catch {}

    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
