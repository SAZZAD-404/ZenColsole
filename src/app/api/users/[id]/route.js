import { NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/lib/localDb";

// GET /api/users/[id]
export async function GET(_, { params }) {
  try {
    const { id } = await params;
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/users/[id]
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await updateUser(id, body);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(_, { params }) {
  try {
    const { id } = await params;
    const deleted = await deleteUser(id);
    if (!deleted) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
