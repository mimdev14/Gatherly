"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function OrganizerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load stats");
        setStats(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  const cards = stats && [
    ["Total events", stats.totals.totalEvents],
    ["Upcoming events", stats.totals.upcomingEvents],
    ["Total volunteers", stats.totals.totalVolunteers],
    ["Available slots", stats.totals.availableSlots],
    ["Completed events", stats.totals.completedEvents],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">Organizer Dashboard</h1>
      <p className="mb-6 text-gray-600">Welcome back, {session?.user.name}</p>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

      {!stats && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      )}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards!.map(([label, value]) => (
              <div key={label as string} className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-3xl font-bold text-brand-800">{value}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold">Upcoming events</h2>
          {stats.upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              No upcoming events.{" "}
              <Link href="/organizer/events/new" className="font-semibold text-brand-700 underline">Create one</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcoming.map((e: any) => {
                const pct = Math.min(100, Math.round((e.registered / e.capacity) * 100));
                return (
                  <div key={e._id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{e.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(e.date).toLocaleString()} · <span className="capitalize">{e.status}</span>
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {e.registered}/{e.capacity} volunteers
                        {e.registered >= e.capacity && <span className="ml-2 text-red-600">FULL</span>}
                      </p>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${e.registered >= e.capacity ? "bg-red-500" : "bg-brand-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}