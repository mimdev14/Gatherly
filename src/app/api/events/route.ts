import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { requireRole } from "@/lib/session";
import { eventSchema } from "@/lib/validators";
import { escapeRegex, getRegisteredCounts, withSlots } from "@/lib/event-utils";

// GET /api/events?q=&category=&location=&time=upcoming|past&mine=true
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category");
    const location = searchParams.get("location")?.trim();
    const time = searchParams.get("time");
    const mine = searchParams.get("mine") === "true";

    const filter: Record<string, any> = {};

    if (mine) {
      const auth = await requireRole("organizer");
      if (!auth.ok) return auth.error;
      filter.organizer = auth.session.user.id; // all statuses, own events only
    } else {
      filter.status = { $in: ["published", "closed"] }; // drafts stay private
    }

    if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
    if (category) filter.category = category;
    if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };

    const now = new Date();
    if (time === "upcoming") filter.date = { $gte: now };
    if (time === "past") filter.date = { $lt: now };
        const date = searchParams.get("date");
    if (date) {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59.999`);
      filter.date = { $gte: start, $lte: end };
    }

    await connectDB();
    const events = await Event.find(filter)
      .sort({ date: time === "past" ? -1 : 1 })
      .lean();

    const counts = await getRegisteredCounts(events.map((e: any) => e._id));
    return NextResponse.json(
      events.map((e: any) => withSlots(e, counts.get(String(e._id)) ?? 0))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole("organizer");
    if (!auth.ok) return auth.error;

    const parsed = eventSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    if (parsed.data.date < new Date()) {
      return NextResponse.json({ error: "Event date must be in the future" }, { status: 400 });
    }

    await connectDB();
    const event = await Event.create({
      ...parsed.data,
      organizer: auth.session.user.id,
      status: "draft",
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}