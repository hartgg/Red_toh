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
    <main className="min-h-screen bg-[#F5F1E8]">
      <header className="border-b border-[#171B18]/10 bg-[#FFFDF7]">
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
            <span className="text-2xl font-bold text-[#171B18]">
              RED TOH
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/student/dashboard"
              className="rounded-xl px-3 py-2 text-[#171B18] hover:bg-[#C63228]/10"
            >
              หน้าผู้เรียน
            </Link>
            <Link
              href="/student/courses"
              className="rounded-xl px-3 py-2 text-[#171B18] hover:bg-[#C63228]/10"
            >
              คอร์สของฉัน
            </Link>
            <Link
              href="/student/profile"
              className="rounded-xl px-3 py-2 text-[#171B18] hover:bg-[#C63228]/10"
            >
              โปรไฟล์
            </Link>
            <Link
              href="/courses"
              className="rounded-xl bg-[#C63228] px-3 py-2 text-white hover:bg-[#A92B23]"
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
