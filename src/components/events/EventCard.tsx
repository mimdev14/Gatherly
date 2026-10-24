import Link from "next/link";

export default function EventCard({ event: e }: { event: any }) {
  const pct = Math.min(100, Math.round((e.registered / e.capacity) * 100));
  const closed = e.status === "closed";

  return (
    <Link
      href={`/events/${e._id}`}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">{e.category}</span>
        {e.isPast ? (
          <span className="text-xs font-semibold text-gray-500">Past event</span>
        ) : e.isFull ? (
          <span className="text-xs font-semibold text-red-600">FULL</span>
        ) : closed || e.deadlinePassed ? (
          <span className="text-xs font-semibold text-amber-600">Registration closed</span>
        ) : null}
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{e.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{e.description}</p>

      <div className="mt-3 space-y-1 text-sm text-gray-700">
        <p>📅 {new Date(e.date).toLocaleString()}</p>
        <p>📍 {e.location}</p>
        <p>⏰ Register by {new Date(e.registrationDeadline).toLocaleDateString()}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {e.requiredSkills.map((s: string) => (
          <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{s}</span>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-600">
          <span>{e.availableSlots} of {e.capacity} slots available</span>
          <span>{e.registered} registered</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div className={`h-2 rounded-full ${e.isFull ? "bg-red-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}