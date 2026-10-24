import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function VolunteerDashboard() {
  const session = await getServerSession(authOptions);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-brand-800">Volunteer Dashboard</h1>
      <p className="my-3">Welcome, {session?.user.name}</p>
      <LogoutButton />
    </main>
  );
}