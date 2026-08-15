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
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAF7] p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold text-green-700">
            RED TOH
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#14532D]">
            สมัครสมาชิกผู้เรียน
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            สำหรับผู้ที่ต้องการเรียนรู้อาชีพเกษตรและติดตามความคืบหน้าของตัวเอง
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-gray-700">
            ชื่อผู้เรียน
          </span>
          <input
            required
            className="w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100"
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
          <span className="text-sm font-semibold text-gray-700">
            อีเมล
          </span>
          <input
            required
            className="w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100"
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
          <span className="text-sm font-semibold text-gray-700">
            รหัสผ่าน
          </span>
          <input
            required
            minLength={6}
            className="w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100"
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
          className="w-full rounded-2xl bg-[#14532D] p-3 font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>

        <p className="text-center text-sm text-gray-600">
          มีบัญชีแล้ว?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#14532D] hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>

        <p className="text-center text-sm text-gray-600">
          เป็นฟาร์มเมอร์และอยากเปิดคอร์ส?{" "}
          <Link
            href="/farmer/register"
            className="font-semibold text-[#14532D] hover:underline"
          >
            สมัครเป็นฟาร์มเมอร์
          </Link>
        </p>
      </form>
    </main>
  );
}
