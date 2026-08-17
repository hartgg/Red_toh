"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ProfileRole =
  | "admin"
  | "farmer"
  | "farmer_pending"
  | "student";

interface LoginProfile {
  role: ProfileRole;
}

function getRolePath(role: ProfileRole) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "farmer") {
    return "/farmer/dashboard";
  }

  if (role === "farmer_pending") {
    return "/farmer/pending";
  }

  return "/student/dashboard";
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<LoginProfile>();

    if (profileError || !profile) {
      alert("ไม่พบข้อมูลสิทธิ์ผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ");
      setLoading(false);
      return;
    }

    router.replace(getRolePath(profile.role));
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F1E8] p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-6 shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold text-[#C63228]">
            RED TOH
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#171B18]">
            เข้าสู่ระบบ
          </h1>
          <p className="mt-2 text-sm text-[#282B28]/75">
            เข้าเรียนคอร์สของคุณ หรือจัดการระบบตามสิทธิ์ผู้ใช้
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#282B28]">
            อีเมล
          </span>
          <input
            required
            className="w-full rounded-2xl border border-[#171B18]/15 p-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#282B28]">
            รหัสผ่าน
          </span>
          <input
            required
            className="w-full rounded-2xl border border-[#171B18]/15 p-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </label>

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-[#C63228] p-3 font-semibold text-white transition hover:bg-[#A92B23] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <p className="text-center text-sm text-[#282B28]/75">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#171B18] hover:underline"
          >
            สมัครสมาชิกผู้เรียน
          </Link>
        </p>

        <p className="text-center text-sm text-[#282B28]/75">
          ต้องการเปิดคอร์สสอน?{" "}
          <Link
            href="/farmer/register"
            className="font-semibold text-[#171B18] hover:underline"
          >
            สมัครเป็นฟาร์มเมอร์
          </Link>
        </p>
      </form>
    </main>
  );
}
