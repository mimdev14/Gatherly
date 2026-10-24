import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { requireRole } from "@/lib/session";

export async function GET() {
  try {
    const auth = await requireRole("organizer");
    if (!auth.ok) return auth.error;

    await connectDB();
    const events: any[] = await Event.find({ organizer: auth.session.user.id }).sort({ date: 1 }).lean();
    const ids = events.map((e) => e._id);

    const rows = ids.length
      ? await Registration.aggregate([
          { $match: { event: { $in: ids } } },
          { $group: { _id: { event: "$event", status: "$status" }, count: { $sum: 1 } } },
        ])
      : [];

    const active = new Map<string, number>();
    const statusTotals: Record<string, number> = { registered: 0, confirmed: 0, attended: 0, cancelled: 0 };
    rows.forEach((r) => {
      statusTotals[r._id.status] += r.count;
      if (r._id.status !== "cancelled") {
        const key = String(r._id.event);
        active.set(key, (active.get(key) ?? 0) + r.count);
      }
    });

    const now = new Date();
    const list = events.map((e) => {
      const registered = active.get(String(e._id)) ?? 0;
      return {
        _id: String(e._id),
        title: e.title,
        category: e.category,
        date: e.date,
        status: e.status,
        capacity: e.capacity,
        registered,
        isPast: new Date(e.date) < now,
      };
    });

    const upcoming = list.filter((e) => !e.isPast);
    const completed = list.filter((e) => e.isPast);

    const availableSlots = upcoming
      .filter((e) => e.status === "published")
      .reduce((sum, e) => sum + Math.max(0, e.capacity - e.registered), 0);

    const categoryMap = new Map<string, number>();
    list.forEach((e) => categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + 1));

    return NextResponse.json({
      totals: {
        totalEvents: list.length,
        upcomingEvents: upcoming.length,
        completedEvents: completed.length,
        totalVolunteers: list.reduce((s, e) => s + e.registered, 0),
        availableSlots,
      },
      upcoming,
      eventsByCategory: [...categoryMap].map(([name, count]) => ({ name, count })),
      registrationsPerEvent: list.map((e) => ({
        name: e.title.length > 14 ? `${e.title.slice(0, 14)}…` : e.title,
        registered: e.registered,
        capacity: e.capacity,
      })),
      volunteerStatus: Object.entries(statusTotals).map(([name, value]) => ({ name, value })),
      upcomingVsCompleted: [
        { name: "Upcoming", value: upcoming.length },
        { name: "Completed", value: completed.length },
      ],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}