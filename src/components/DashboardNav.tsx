"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Logo size={32} />
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === l.href ? "bg-brand-50 text-brand-800" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}