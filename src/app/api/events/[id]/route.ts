import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { requireRole } from "@/lib/session";
import { getRegisteredCounts } from "@/lib/event-utils";

type Ctx = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request, { params }: Ctx) {
  try {
    const auth = await requireRole("volunteer");
    if (!auth.ok) return auth.error; // organizers get 403 here

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return fail("Event not found", 404);

    const { selectedSkill } = await req.json();

    await connectDB();
    const event: any = await Event.findById(id).lean();
    if (!event || event.status === "draft") return fail("Event not found", 404);
    if (event.status === "closed") return fail("Registration is closed for this event", 400);

    const now = new Date();
    if (new Date(event.date) < now) return fail("This event has already taken place", 400);
    if (new Date(event.registrationDeadline) < now) return fail("The registration deadline has passed", 400);
    if (!selectedSkill || !event.requiredSkills.includes(selectedSkill)) {
      return fail("Please select one of the required skills", 400);
    }

    const volunteerId = auth.session.user.id;
    const existing = await Registration.findOne({ event: id, volunteer: volunteerId });
    if (existing && existing.status !== "cancelled") {
      return fail("You are already registered for this event", 409);
    }

    const counts = await getRegisteredCounts([event._id]);
    if ((counts.get(String(event._id)) ?? 0) >= event.capacity) {
      return fail("Sorry, this event is full", 409);
    }

    let reg;
    if (existing) {
      // re-register after a cancellation
      existing.status = "registered";
      existing.selectedSkill = selectedSkill;
      reg = await existing.save();
    } else {
      reg = await Registration.create({ event: id, volunteer: volunteerId, selectedSkill });
    }

    // Race guard: two people clicking at the same moment for the last slot
    const after = await getRegisteredCounts([event._id]);
    if ((after.get(String(event._id)) ?? 0) > event.capacity) {
      reg.status = "cancelled";
      await reg.save();
      return fail("Sorry, this event just became full", 409);
    }

    return NextResponse.json(reg, { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) return fail("You are already registered for this event", 409);
    console.error(err);
    return fail("Registration failed", 500);
  }
}