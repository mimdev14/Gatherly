"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#1e9a6d", "#0f766e", "#34b98a", "#f59e0b", "#6b7280"];

function ChartCard({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-gray-800">{title}</h2>
      {empty ? (
        <p className="py-16 text-center text-sm text-gray-500">No data yet</p>
      ) : (
        <div className="h-72">{children}</div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load analytics");
        setStats(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!stats) return <div className="h-64 animate-pulse rounded-xl bg-gray-200" />;

  const pieData = (rows: { name: string; value: number }[]) => rows.filter((r) => r.value > 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-800">Analytics</h1>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Events by category" empty={stats.eventsByCategory.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.eventsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Events" fill="#1e9a6d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volunteer registrations per event" empty={stats.registrationsPerEvent.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.registrationsPerEvent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="registered" name="Registered" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" name="Capacity" fill="#d1fae5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Volunteer status breakdown"
          empty={pieData(stats.volunteerStatus).length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData(stats.volunteerStatus)} dataKey="value" nameKey="name" outerRadius={90} label>
                {pieData(stats.volunteerStatus).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Upcoming vs completed events"
          empty={pieData(stats.upcomingVsCompleted).length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData(stats.upcomingVsCompleted)} dataKey="value" nameKey="name" outerRadius={90} label>
                {pieData(stats.upcomingVsCompleted).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}