import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="bg-brand-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-brand-900 sm:text-5xl">
            Bring People Together. Make a Difference.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Gatherly helps community organizations publish events and manage volunteers, and helps volunteers
            find opportunities that match their skills.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/events" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
              Browse events
            </Link>
            <Link href="/register" className="rounded-lg border border-brand-600 px-6 py-3 font-semibold text-brand-700 hover:bg-white">
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-14 md:grid-cols-3">
        {[
          ["For organizers", "Create events, set volunteer requirements, and track registrations in one place."],
          ["For volunteers", "Discover events, register for ones that fit your skills, and manage your participation."],
          ["Built for small teams", "Simple workflows, clear capacity tracking, and no complicated setup."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-brand-800">{t}</h3>
            <p className="mt-2 text-sm text-gray-600">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}