"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CATEGORIES } from "@/lib/constants";

const toLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const input =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function EventForm({ eventId, initial }: { eventId?: string; initial?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [idea, setIdea] = useState("");
  const [promo, setPromo] = useState("");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    date: toLocal(initial?.date),
    location: initial?.location ?? "",
    category: initial?.category ?? CATEGORIES[0],
    capacity: initial?.capacity ?? 20,
    skills: (initial?.requiredSkills ?? []).join(", "),
    registrationDeadline: toLocal(initial?.registrationDeadline),
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function generate() {
    if (idea.trim().length < 5) return toast.error("Write a short event idea first");
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");
      setForm((f) => ({
        ...f,
        title: f.title || data.title || f.title,
        description: `${data.description}\n\nVolunteer roles:\n${data.roles.map((r: string) => `- ${r}`).join("\n")}`,
        skills: data.skills.join(", "),
      }));
      setPromo(data.promo);
      toast.success("Draft generated. Review and edit before saving.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { skills, ...rest } = form;
    const payload = {
      ...rest,
      capacity: Number(form.capacity),
      requiredSkills: skills.split(",").map((s: string) => s.trim()).filter(Boolean),
      date: form.date ? new Date(form.date).toISOString() : "",
      registrationDeadline: form.registrationDeadline
        ? new Date(form.registrationDeadline).toISOString()
        : "",
    };

    const res = await fetch(eventId ? `/api/events/${eventId}` : "/api/events", {
      method: eventId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) return toast.error(data.error || "Could not save event");
    toast.success(eventId ? "Event updated" : "Event created as draft");
    router.push("/organizer/events");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* AI assistant */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
        <h2 className="font-semibold text-brand-800">AI Event Description Assistant</h2>
        <p className="mb-3 text-sm text-gray-600">
          Describe your idea in one line. You can review and edit everything before saving.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="We want to organize a tree plantation program"
            className={input}
          />
          <button
            type="button"
            onClick={generate}
            disabled={aiLoading}
            className="whitespace-nowrap rounded-lg bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {aiLoading ? "Generating..." : "Generate with AI"}
          </button>
        </div>
        {promo && (
          <div className="mt-3">
            <label className="text-sm font-medium text-gray-700">Promotional message (editable)</label>
            <textarea value={promo} onChange={(e) => setPromo(e.target.value)} rows={3} className={input} />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Event title</label>
          <input value={form.title} onChange={set("title")} required className={input} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea value={form.description} onChange={set("description")} required rows={7} className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Event date and time</label>
          <input type="datetime-local" value={form.date} onChange={set("date")} required className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Registration deadline</label>
          <input
            type="datetime-local"
            value={form.registrationDeadline}
            onChange={set("registrationDeadline")}
            required
            className={input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input value={form.location} onChange={set("location")} required className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select value={form.category} onChange={set("category")} className={input}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Maximum volunteer capacity</label>
          <input type="number" min={1} value={form.capacity} onChange={set("capacity")} required className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Required skills (comma separated)</label>
          <input
            value={form.skills}
            onChange={set("skills")}
            placeholder="Gardening, Teamwork, First aid"
            required
            className={input}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          disabled={saving}
          className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : eventId ? "Save changes" : "Create event"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}