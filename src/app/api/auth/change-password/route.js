import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { verifyUserPassword, updateUser } from "@/lib/supabaseDb";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "9router-default-secret-change-me"
);

/**
 * Change Password API
 * POST /api/auth/change-password
 * Allows authenticated users to change their password
 */
export async function POST(request) {
  try {
    // Get user from JWT
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userEmail = payload.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get passwords from request
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Verify current password
    const user = await verifyUserPassword(userEmail, currentPassword);
    
    if (!user) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Update password
    await updateUser(user.id, { password: newPassword });

    return NextResponse.json({ 
      success: true,
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("[Change Password] Error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
