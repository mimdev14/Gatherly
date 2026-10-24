import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type Role = "organizer" | "volunteer";
type Result =
  | { ok: true; session: Session }
  | { ok: false; error: NextResponse };

export async function requireRole(role: Role): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { ok: false, error: NextResponse.json({ error: "Please log in first" }, { status: 401 }) };
  }
  if (session.user.role !== role) {
    return {
      ok: false,
      error: NextResponse.json({ error: `Only ${role}s can perform this action` }, { status: 403 }),
    };
  }
  return { ok: true, session };
}