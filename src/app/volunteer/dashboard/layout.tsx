import DashboardNav from "@/components/DashboardNav";

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        links={[
          { href: "/volunteer/dashboard", label: "Dashboard" },
          { href: "/events", label: "Browse Events" },
          { href: "/volunteer/my-events", label: "My Events" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}