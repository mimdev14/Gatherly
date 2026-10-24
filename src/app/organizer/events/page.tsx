"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const badge: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  closed: "bg-amber-100 text-amber-700",
};

export default function ManageEventsPage() {
  const [events, setEvents] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/events?mine=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events");
      setEvents(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "publish" | "close" | "reopen") {
    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Action failed");
    toast.success(
      action === "publish" ? "Event published" : action === "close" ? "Registrations closed" : "Registrations reopened"
    );
    load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setBusy(true);
    const res = await fetch(`/api/events/${deleteId}`, { method: "DELETE" });
    const data = await res.json();
    setBusy(false);
    setDeleteId(null);
    if (!res.ok) return toast.error(data.error || "Delete failed");
    toast.success("Event deleted");
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">Manage Events</h1>
        <Link href="/organizer/events/new" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
          + New event
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {!events && !error && <p className="text-gray-500">Loading events...</p>}

      {events && events.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-600">You haven&apos;t created any events yet.</p>
          <Link href="/organizer/events/new" className="mt-3 inline-block font-semibold text-brand-700 underline">
            Create your first event
          </Link>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">Date</th>
                <th className="p-3">Volunteers</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e._id} className="border-t border-gray-100">
                  <td className="p-3">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-gray-500">{e.location} · {e.category}</p>
                  </td>
                  <td className="p-3">{new Date(e.date).toLocaleString()}</td>
                  <td className="p-3">
                    {e.registered}/{e.capacity}
                    {e.isFull && <span className="ml-2 text-xs font-semibold text-red-600">FULL</span>}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${badge[e.status]}`}>
                      {e.status}
                    </span>
                    {e.isPast && <span className="ml-2 text-xs text-gray-500">Past</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/organizer/events/${e._id}/edit`} className="text-brand-700 underline">Edit</Link>
                      <Link href={`/organizer/events/${e._id}/volunteers`} className="text-brand-700 underline">Volunteers</Link>
                      {e.status === "draft" && (
                        <button onClick={() => act(e._id, "publish")} className="text-green-700 underline">Publish</button>
                      )}
                      {e.status === "published" && (
                        <button onClick={() => act(e._id, "close")} className="text-amber-700 underline">Close registration</button>
                      )}
                      {e.status === "closed" && (
                        <button onClick={() => act(e._id, "reopen")} className="text-green-700 underline">Reopen</button>
                      )}
                      <button onClick={() => setDeleteId(e._id)} className="text-red-600 underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this event?"
        message="This also removes all volunteer registrations for it. This cannot be undone."
        confirmText="Delete"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}