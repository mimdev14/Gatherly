import EventForm from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Create Event</h1>
      <EventForm />
    </div>
  );
}