"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status: authStatus } = useSession();
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState("");
  const [myReg, setMyReg] = useState<any>(null);
  const [skill, setSkill] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/events/${id}`);
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Event not found");
    setEvent(data);
    setSkill((s) => s || data.requiredSkills[0] || "");
  }, [id]);

  const loadMine = useCallback(async () => {
    const res = await fetch("/api/registrations/mine");
    if (!res.ok) return;
    const regs = await res.json();
    setMyReg(regs.find((r: any) => r.event._id === id && r.status !== "cancelled") ?? null);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (session?.user.role === "volunteer") loadMine();
  }, [session, loadMine]);

  async function register() {
    setBusy(true);
    const res = await fetch(`/api/events/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedSkill: skill }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      toast.error(data.error || "Registration failed");
      return load(); // refresh slots in case it just became full
    }
    toast.success("You are registered!");
    load();
    loadMine();
  }

  if (error) return <main className="mx-auto max-w-3xl p-8"><p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p></main>;
  if (!event) return <main className="mx-auto max-w-3xl p-8"><div className="h-64 animate-pulse rounded-xl bg-gray-200" /></main>;

  const role = session?.user.role;
  const canRegister = event.status === "published" && !event.isPast && !event.deadlinePassed && !event.isFull;

  let blockReason = "";
  if (event.isPast) blockReason = "This event has already taken place.";
  else if (event.status === "closed") blockReason = "Registration is closed for this event.";
  else if (event.deadlinePassed) blockReason = "The registration deadline has passed.";
  else if (event.isFull) blockReason = "This event is full.";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/events" className="text-sm text-brand-700 underline">← Back to events</Link>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">{event.category}</span>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">{event.title}</h1>
        <p className="mt-3 whitespace-pre-line text-gray-700">{event.description}</p>

        <div className="mt-5 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <p>📅 <b>Date:</b> {new Date(event.date).toLocaleString()}</p>
          <p>📍 <b>Location:</b> {event.location}</p>
          <p>⏰ <b>Register by:</b> {new Date(event.registrationDeadline).toLocaleString()}</p>
          <p>👥 <b>Slots:</b> {event.availableSlots} available of {event.capacity}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {event.requiredSkills.map((s: string) => (
            <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs">{s}</span>
          ))}
        </div>

        {event.isFull && !event.isPast && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 font-semibold text-red-700">This event is full. Registration is disabled.</p>
        )}

        <div className="mt-6 border-t border-gray-100 pt-5">
          {authStatus === "loading" && <p className="text-gray-500">Checking your account...</p>}

          {authStatus === "unauthenticated" && (
            <Link href={`/login?callbackUrl=/events/${id}`} className="inline-block rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">
              Log in to register
            </Link>
          )}

          {role === "organizer" && (
            <p className="text-gray-600">Organizers cannot register as volunteers.</p>
          )}

          {role === "volunteer" && myReg && (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="font-semibold text-green-800">You are registered for this event</p>
              <p className="text-sm text-green-700">
                Status: <b className="capitalize">{myReg.status}</b> · Skill: {myReg.selectedSkill}
              </p>
              <Link href="/volunteer/my-events" className="text-sm text-brand-700 underline">Manage in My Events</Link>
            </div>
          )}

          {role === "volunteer" && !myReg && (
            canRegister ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Choose the skill you will contribute</label>
                  <select value={skill} onChange={(e) => setSkill(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                    {event.requiredSkills.map((s: string) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={register} disabled={busy} className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {busy ? "Registering..." : "Register now"}
                </button>
              </div>
            ) : (
              <button disabled className="cursor-not-allowed rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-500">
                {blockReason || "Registration unavailable"}
              </button>
            )
          )}
        </div>
      </div>
    </main>
  );
}