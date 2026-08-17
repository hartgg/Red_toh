"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

interface FarmerLayoutShellProps {
  children: ReactNode;
}

const publicFarmerPaths = new Set([
  "/farmer/register",
  "/farmer/pending",
]);

export default function FarmerLayoutShell({
  children,
}: FarmerLayoutShellProps) {
  const pathname = usePathname();

  if (publicFarmerPaths.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />

      <div className="flex min-h-[calc(100vh-64px)] bg-[#F5F1E8]">
        <Sidebar />

        <main className="flex-1 p-6 md:ml-64 md:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
