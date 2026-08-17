"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
  });

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);

    const fullName = form.full_name.trim();
    const email = form.email.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          full_name: fullName,
          role: "student",
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert(
      "สมัครสมาชิกผู้เรียนสำเร็จ กรุณาเข้าสู่ระบบ หรือยืนยันอีเมลก่อนถ้าระบบร้องขอ"
    );
    router.push("/login");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F1E8] p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-6 shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold text-[#2E7D32]">
            RED TOH
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#171B18]">
            สมัครสมาชิกผู้เรียน
          </h1>
          <p className="mt-2 text-sm text-[#282B28]/75">
            สำหรับผู้ที่ต้องการเรียนรู้อาชีพเกษตรและติดตามความคืบหน้าของตัวเอง
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#282B28]">
            ชื่อผู้เรียน
          </span>
          <input
            required
            className="w-full rounded-2xl border border-[#2E7D32]/25 p-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            placeholder="เช่น สมชาย ใจดี"
            value={form.full_name}
            onChange={(event) =>
              setForm({
                ...form,
                full_name: event.target.value,
              })
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#282B28]">
            อีเมล
          </span>
          <input
            required
            className="w-full rounded-2xl border border-[#2E7D32]/25 p-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value,
              })
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#282B28]">
            รหัสผ่าน
          </span>
          <input
            required
            minLength={6}
            className="w-full rounded-2xl border border-[#2E7D32]/25 p-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
          />
        </label>

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-[#C63228] p-3 font-semibold text-white transition hover:bg-[#A92B23] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>

        <p className="text-center text-sm text-[#282B28]/75">
          มีบัญชีแล้ว?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#171B18] hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>

        <p className="text-center text-sm text-[#282B28]/75">
          เป็นฟาร์มเมอร์และอยากเปิดคอร์ส?{" "}
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
