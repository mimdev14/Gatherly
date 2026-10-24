"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/events/EventCard";
import { CATEGORIES } from "@/lib/constants";

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function EventsPage() {
  const [f, setF] = useState({ q: "", category: "", location: "", date: "", time: "upcoming" });
  const [events, setEvents] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    const t = setTimeout(async () => {
      setEvents(null);
      setError("");
      try {
        const params = new URLSearchParams();
        Object.entries(f).forEach(([k, v]) => v && params.set(k, v));
        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load events");
        setEvents(data);
      } catch (e: any) {
        setError(e.message);
      }
    }, 350); // debounce typing
    return () => clearTimeout(t);
  }, [f]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Browse Events</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input placeholder="Search by title..." value={f.q} onChange={set("q")} className={`${input} lg:col-span-2`} />
        <select value={f.category} onChange={set("category")} className={input}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Location" value={f.location} onChange={set("location")} className={input} />
        <select value={f.time} onChange={set("time")} className={input}>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="">All</option>
        </select>
        <input type="date" value={f.date} onChange={set("date")} className={input} />
        <button
          onClick={() => setF({ q: "", category: "", location: "", date: "", time: "upcoming" })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          Clear filters
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

      {!events && !error && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      )}

      {events && events.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          No events match your search. Try changing the filters.
        </div>
      )}

      {events && events.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => <EventCard key={e._id} event={e} />)}
        </div>
      )}
    </main>
  );
}