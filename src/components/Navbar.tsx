"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import clsx from "clsx";

import { farmerMenus } from "@/components/farmerNavigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-green-100 bg-[#F8FAF7]/90 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-6 lg:px-8">
        <Link
          href="/farmer/dashboard"
          className="flex items-center gap-3"
          onClick={closeMenu}
        >
          <Image
            src="/logo.png"
            width={45}
            height={45}
            alt="RED TOH Logo"
          />

          <div>
            <h1 className="text-xl font-bold text-[#14532D]">
              RED TOH
            </h1>

            <p className="text-xs text-gray-500">
              Smart Agriculture Learning
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-[#14532D] px-5 py-2 text-white transition hover:bg-[#166534]"
          >
            <LogOut size={18} />
            ออกจากระบบ
          </button>
        </div>

        <button
          type="button"
          className="text-[#14532D] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="เปิดเมนู"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-green-100 bg-white px-6 py-4 md:hidden">
          {farmerMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive =
              pathname === menu.href ||
              (menu.href !== "/farmer/dashboard" &&
                pathname.startsWith(menu.href));

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={closeMenu}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition",
                  isActive
                    ? "bg-green-100 font-semibold text-[#14532D]"
                    : "text-gray-700 hover:bg-green-50 hover:text-[#14532D]"
                )}
              >
                <Icon size={20} />
                {menu.name}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14532D] py-3 text-white"
          >
            <LogOut size={18} />
            ออกจากระบบ
          </button>
        </div>
      )}
    </nav>
  );
}
