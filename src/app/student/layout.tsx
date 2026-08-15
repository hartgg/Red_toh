import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import LogoutButton from "@/components/student/LogoutButton";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="RED TOH Logo"
            />
            <span className="text-2xl font-bold text-[#14532D]">
              RED TOH
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/student/dashboard"
              className="rounded-xl px-3 py-2 text-[#14532D] hover:bg-green-50"
            >
              หน้าผู้เรียน
            </Link>
            <Link
              href="/student/courses"
              className="rounded-xl px-3 py-2 text-[#14532D] hover:bg-green-50"
            >
              คอร์สของฉัน
            </Link>
            <Link
              href="/student/profile"
              className="rounded-xl px-3 py-2 text-[#14532D] hover:bg-green-50"
            >
              โปรไฟล์
            </Link>
            <Link
              href="/courses"
              className="rounded-xl bg-[#14532D] px-3 py-2 text-white hover:bg-[#166534]"
            >
              หาอาชีพเพิ่ม
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      {children}
    </main>
  );
}
