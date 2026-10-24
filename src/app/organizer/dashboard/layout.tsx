import DashboardNav from "@/components/DashboardNav";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        links={[
          { href: "/organizer/dashboard", label: "Dashboard" },
          { href: "/organizer/events", label: "Manage Events" },
          { href: "/organizer/events/new", label: "Create Event" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}