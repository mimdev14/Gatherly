import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { requireRole } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireRole("organizer");
  if (!auth.ok) return auth.error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await connectDB();
  const event: any = await Event.findById(id).lean();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (String(event.organizer) !== auth.session.user.id) {
    return NextResponse.json({ error: "You can only view volunteers of your own events" }, { status: 403 });
  }

  const regs: any[] = await Registration.find({ event: id })
    .populate("volunteer", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const registered = regs.filter((r) => r.status !== "cancelled").length;

  return NextResponse.json({
    event: { _id: String(event._id), title: event.title, capacity: event.capacity, registered },
    volunteers: regs
      .filter((r) => r.volunteer)
      .map((r) => ({
        _id: String(r._id),
        name: r.volunteer.name,
        email: r.volunteer.email,
        registeredAt: r.createdAt,
        selectedSkill: r.selectedSkill,
        status: r.status,
      })),
  });
}