import Image from "next/image";
import Link from "next/link";

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/logo.png" alt="Gatherly logo" width={size} height={size} priority />
      <span className="text-xl font-bold text-brand-800">Gatherly</span>
    </Link>
  );
}