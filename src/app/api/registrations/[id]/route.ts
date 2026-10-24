import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { getRegisteredCounts } from "@/lib/event-utils";

type Ctx = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const STATUSES = ["registered", "confirmed", "attended", "cancelled"];

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return fail("Please log in first", 401);

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return fail("Registration not found", 404);

  const { status } = await req.json();
  if (!STATUSES.includes(status)) return fail("Invalid status", 400);

  await connectDB();
  const reg = await Registration.findById(id);
  if (!reg) return fail("Registration not found", 404);

  const event: any = await Event.findById(reg.event).lean();
  if (!event) return fail("This event no longer exists", 404);

  if (session.user.role === "volunteer") {
    if (String(reg.volunteer) !== session.user.id) {
      return fail("You can only manage your own registration", 403);
    }
    if (status !== "cancelled") return fail("Volunteers can only cancel their registration", 403);
    if (reg.status === "cancelled") return fail("Registration is already cancelled", 400);
    if (reg.status === "attended") return fail("You have already attended this event", 400);
    if (new Date(event.date) < new Date()) return fail("Past events cannot be cancelled", 400);
  } else {
    if (String(event.organizer) !== session.user.id) {
      return fail("You can only manage volunteers of your own events", 403);
    }
    if (reg.status === "cancelled" && status !== "cancelled") {
      const counts = await getRegisteredCounts([event._id]);
      if ((counts.get(String(event._id)) ?? 0) >= event.capacity) {
        return fail("Event is full, cannot reactivate this volunteer", 409);
      }
    }
  }

  reg.status = status;
  await reg.save();
  return NextResponse.json(reg);
}