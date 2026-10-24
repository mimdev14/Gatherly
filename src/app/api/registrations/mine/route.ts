import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { requireRole } from "@/lib/session";

export async function GET() {
  const auth = await requireRole("volunteer");
  if (!auth.ok) return auth.error;

  await connectDB();
  // Only this user's registrations: nobody can read another user's data
  const regs = await Registration.find({ volunteer: auth.session.user.id })
    .populate("event")
    .sort({ createdAt: -1 })
    .lean();

  const now = new Date();
  const data = regs
    .filter((r: any) => r.event) // skip deleted events
    .map((r: any) => ({
      ...r,
      _id: String(r._id),
      event: { ...r.event, _id: String(r.event._id) },
      isPast: new Date(r.event.date) < now,
    }));
  return NextResponse.json(data);
}