"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"volunteer" | "organizer">("volunteer");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return toast.error(data.error || "Registration failed");
    toast.success("Account created! Please log in.");
    router.push("/login");
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Create your Gatherly account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="name" placeholder="Full name" required className={input} />
        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Password (min 6 chars)" required className={input} />

        <div className="grid grid-cols-2 gap-3">
          {(["volunteer", "organizer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border px-3 py-2 capitalize ${
                role === r ? "border-brand-600 bg-brand-50 text-brand-800" : "border-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link href="/login" className="text-brand-700 underline">Log in</Link>
      </p>
    </main>
  );
}