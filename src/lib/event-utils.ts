import { Types } from "mongoose";
import Registration from "@/models/Registration";

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Cancelled registrations do not take a slot
export async function getRegisteredCounts(eventIds: unknown[]) {
  const rows = await Registration.aggregate([
    {
      $match: {
        event: { $in: eventIds.map((id) => new Types.ObjectId(String(id))) },
        status: { $ne: "cancelled" },
      },
    },
    { $group: { _id: "$event", count: { $sum: 1 } } },
  ]);
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(String(r._id), r.count));
  return map;
}

export function withSlots(e: any, registered: number) {
  const now = new Date();
  return {
    ...e,
    _id: String(e._id),
    organizer: String(e.organizer),
    registered,
    availableSlots: Math.max(0, e.capacity - registered),
    isFull: registered >= e.capacity,
    isPast: new Date(e.date) < now,
    deadlinePassed: new Date(e.registrationDeadline) < now,
  };
}