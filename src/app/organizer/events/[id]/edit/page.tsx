"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EventForm from "@/components/events/EventForm";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Event not found");
        setEvent(d);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!event) return <p className="text-gray-500">Loading event...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Edit Event</h1>
      <EventForm eventId={id} initial={event} />
    </div>
  );
}