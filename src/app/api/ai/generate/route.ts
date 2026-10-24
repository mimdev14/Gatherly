import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";

export async function POST(req: Request) {
  const auth = await requireRole("organizer");
  if (!auth.ok) return auth.error;

  const { idea } = await req.json();
  if (!idea || idea.trim().length < 5) {
    return NextResponse.json({ error: "Please enter a short event idea" }, { status: 400 });
  }
  const topic = idea.trim().replace(/^we want to (organize|organise|host|run)\s+(a|an)?\s*/i, "");

  // Mock response (no live LLM key needed)
  return NextResponse.json({
    title: topic.charAt(0).toUpperCase() + topic.slice(1),
    description: `Join us for a community event: ${topic}. This is a chance to meet neighbours, work together, and make a lasting difference in our community. No experience is needed, just enthusiasm and a willingness to help.`,
    roles: ["Team Coordinator", "On-site Helper", "Registration Desk", "Logistics and Supplies"],
    skills: ["Teamwork", "Communication", "Physical Stamina", "Organization"],
    promo: `Be part of something good! Join our "${topic}" and help us make a difference. Limited volunteer spots, so register today!`,
  });
}