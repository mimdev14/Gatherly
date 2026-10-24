"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUSES = ["registered", "confirmed", "attended", "cancelled"];

export default function EventVolunteersPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${id}/volunteers`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load volunteers");
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(regId: string, status: string) {
    const res = await fetch(`/api/registrations/${regId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const d = await res.json();
    if (!res.ok) toast.error(d.error || "Could not update status");
    else toast.success(`Status updated to ${status}`);
    load();
  }

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!data) return <div className="h-40 animate-pulse rounded-xl bg-gray-200" />;

  return (
    <div>
      <Link href="/organizer/events" className="text-sm text-brand-700 underline">← Back to events</Link>
      <h1 className="mt-2 text-2xl font-bold text-brand-800">{data.event.title}</h1>
      <p className="mb-6 text-gray-600">
        {data.event.registered} of {data.event.capacity} slots filled
      </p>

      {data.volunteers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          No volunteers have registered for this event yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Registered on</th>
                <th className="p-3">Skill</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.volunteers.map((v: any) => (
                <tr key={v._id} className="border-t border-gray-100">
                  <td className="p-3 font-medium">{v.name}</td>
                  <td className="p-3">{v.email}</td>
                  <td className="p-3">{new Date(v.registeredAt).toLocaleDateString()}</td>
                  <td className="p-3">{v.selectedSkill}</td>
                  <td className="p-3">
                    <select
                      value={v.status}
                      onChange={(e) => changeStatus(v._id, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1 capitalize"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}