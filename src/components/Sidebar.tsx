"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { farmerMenus } from "@/components/farmerNavigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-green-100 bg-[#F8FAF7] px-5 py-6 md:flex">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#14532D]">
          RED TOH
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          แผงจัดการเกษตรกร
        </p>
      </div>

      <nav className="space-y-2">
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
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition",
                isActive
                  ? "bg-green-100 font-semibold text-[#14532D]"
                  : "text-gray-700 hover:bg-green-100 hover:text-[#14532D]"
              )}
            >
              <Icon size={20} />
              <span>{menu.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
