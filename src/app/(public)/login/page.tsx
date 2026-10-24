"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      return toast.error("Invalid email or password");
    }

    const session = await getSession();
    toast.success("Welcome back!");
        window.location.href =
      session?.user.role === "organizer" ? "/organizer/dashboard" : "/volunteer/dashboard";
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Log in to Gatherly</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Password" required className={input} />
        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        New here? <Link href="/register" className="text-brand-700 underline">Create an account</Link>
      </p>
    </main>
  );
}