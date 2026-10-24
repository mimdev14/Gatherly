import PublicNav from "@/components/PublicNav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      {children}
    </div>
  );
}