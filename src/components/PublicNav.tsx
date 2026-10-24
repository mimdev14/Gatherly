"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/ui/Logo";

export default function PublicNav() {
  const { data: session, status } = useSession();
  const dash = session?.user.role === "organizer" ? "/organizer/dashboard" : "/volunteer/dashboard";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Logo size={32} />
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/events" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">Events</Link>
          {status === "authenticated" ? (
            <>
              <Link href={dash} className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg border border-brand-600 px-4 py-2 text-brand-700 hover:bg-brand-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">Log in</Link>
              <Link href="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}