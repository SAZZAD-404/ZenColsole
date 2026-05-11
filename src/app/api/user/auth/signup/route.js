import { NextResponse } from "next/server";
import { createUser, getUserSettings } from "@/lib/localDb";

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }

    // Check if registration is enabled
    const userSettings = await getUserSettings();
    if (!userSettings.registrationEnabled) {
      return NextResponse.json({ error: "Registration is currently disabled" }, { status: 403 });
    }

    const user = await createUser({ username, email, password, role: "user" });
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    if (error.message === "Email already in use" || error.message === "Username already taken") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
