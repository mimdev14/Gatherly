"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-brand-600 px-4 py-2 text-brand-700 hover:bg-brand-50"
    >
      Log out
    </button>
  );
}