import { NextResponse } from "next/server";
import { getUsers, createUser, getUserSettings, updateUserSettings } from "@/lib/localDb";

export const dynamic = "force-dynamic";

// GET /api/users — list all users + userSettings
export async function GET() {
  try {
    const [users, userSettings] = await Promise.all([getUsers(), getUserSettings()]);
    return NextResponse.json({ users, userSettings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users — admin creates a user
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, role = "user" } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "username, email, and password are required" }, { status: 400 });
    }

    const user = await createUser({ username, email, password, role });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error.message === "Email already in use" || error.message === "Username already taken") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/users — update userSettings (allowedModels, registrationEnabled)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const settings = await updateUserSettings(body);
    return NextResponse.json({ userSettings: settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
