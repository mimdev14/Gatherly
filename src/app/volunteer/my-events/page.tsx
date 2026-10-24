"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const badge: Record<string, string> = {
  registered: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  attended: "bg-brand-100 text-brand-800",
  cancelled: "bg-gray-200 text-gray-600",
};

export default function MyEventsPage() {
  const [regs, setRegs] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/registrations/mine");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load your events");
      setRegs(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function confirmCancel() {
    if (!cancelId) return;
    setBusy(true);
    const res = await fetch(`/api/registrations/${cancelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const data = await res.json();
    setBusy(false);
    setCancelId(null);
    if (!res.ok) return toast.error(data.error || "Could not cancel");
    toast.success("Registration cancelled");
    load();
  }

  const list = (regs ?? []).filter((r) => (tab === "past" ? r.isPast : !r.isPast));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand-800">My Events</h1>

      <div className="mb-5 flex gap-2">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-brand-600 text-white" : "border border-gray-300 bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {!regs && !error && <div className="h-32 animate-pulse rounded-xl bg-gray-200" />}

      {regs && list.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          No {tab} events.{" "}
          {tab === "upcoming" && <Link href="/events" className="font-semibold text-brand-700 underline">Browse events</Link>}
        </div>
      )}

      <div className="space-y-4">
        {list.map((r) => (
          <div key={r._id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href={`/events/${r.event._id}`} className="text-lg font-semibold text-gray-900 hover:underline">
                {r.event.title}
              </Link>
              <p className="text-sm text-gray-600">
                📅 {new Date(r.event.date).toLocaleString()} · 📍 {r.event.location}
              </p>
              <p className="text-sm text-gray-600">Your skill: {r.selectedSkill}</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${badge[r.status]}`}>
                {r.status}
              </span>
            </div>

            {!r.isPast && (r.status === "registered" || r.status === "confirmed") && (
              <button
                onClick={() => setCancelId(r._id)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Cancel registration
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel your registration?"
        message="Your slot will be released for other volunteers."
        confirmText="Yes, cancel"
        loading={busy}
        onConfirm={confirmCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}