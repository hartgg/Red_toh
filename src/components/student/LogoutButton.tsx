"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
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
      className="rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-[#14532D] transition hover:bg-green-50 disabled:opacity-60"
    >
      {loading ? "กำลังออก..." : "ออกจากระบบ"}
    </button>
  );
}
