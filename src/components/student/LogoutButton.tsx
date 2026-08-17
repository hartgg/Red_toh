"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={clsx(
        "rounded-xl border border-[#2E7D32]/25 px-3 py-2 text-sm font-semibold text-[#171B18] transition hover:bg-[#2E7D32]/10 disabled:opacity-60",
        className
      )}
    >
      {loading ? "กำลังออก..." : "ออกจากระบบ"}
    </button>
  );
}
