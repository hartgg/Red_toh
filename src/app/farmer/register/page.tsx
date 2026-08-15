"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function FarmerRegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    province: "",
    farm_area: "",
    agriculture_type: "",
  });

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);

    const fullName = form.full_name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const province = form.province.trim();
    const farmArea = form.farm_area.trim();
    const agricultureType = form.agriculture_type.trim();

    if (!fullName || !province || !agricultureType) {
      alert("กรุณากรอกชื่อ จังหวัด และประเภทเกษตรที่ทำ");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          full_name: fullName,
          role: "farmer_pending",
          phone,
          province,
          farm_area: farmArea,
          agriculture_type: agricultureType,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert(
      "ส่งคำขอสมัครเป็นฟาร์มเมอร์สำเร็จ กรุณารอผู้ดูแลระบบอนุมัติ หรือยืนยันอีเมลก่อนถ้าระบบร้องขอ"
    );
    router.push("/farmer/pending");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAF7] p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-2xl space-y-5 rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
      >
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            RED TOH
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-[#14532D]">
            สมัครเป็นฟาร์มเมอร์/ผู้สอน
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            ส่งคำขอให้ผู้ดูแลระบบตรวจสอบก่อนเปิดสิทธิ์สร้างคอร์ส เพื่อความปลอดภัยของระบบจริง
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-gray-700">
              ชื่อ-นามสกุล
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

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-gray-700">
              เบอร์โทร
            </span>
            <input
              className="w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100"
              placeholder="0812345678"
              inputMode="tel"
              value={form.phone}
              onChange={(event) =>
                setForm({
                  ...form,
                  phone: event.target.value,
                })
              }
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-gray-700">
              จังหวัด
            </span>
            <input
              required
              className="w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100"
              placeholder="เช่น เชียงใหม่"
              value={form.province}
              onChange={(event) =>
                setForm({
                  ...form,
                  province: event.target.value,
                })
              }
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-gray-700">
              พื้นที่ทำการเกษตร
            </span>
            <input
              className="w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100"
              placeholder="เช่น 10 ไร่"
              value={form.farm_area}
              onChange={(event) =>
                setForm({
                  ...form,
                  farm_area: event.target.value,
                })
              }
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-gray-700">
              ประเภทเกษตรที่ทำ
            </span>
            <input
              required
              className="w-full rounded-2xl border border-green-200 p-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100"
              placeholder="เช่น ปลูกผัก เลี้ยงปลา ทำสวนผลไม้"
              value={form.agriculture_type}
              onChange={(event) =>
                setForm({
                  ...form,
                  agriculture_type: event.target.value,
                })
              }
            />
          </label>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-[#14532D] p-3 font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "กำลังส่งคำขอ..." : "ส่งคำขอสมัครเป็นฟาร์มเมอร์"}
        </button>

        <p className="text-center text-sm text-gray-600">
          สมัครเป็นผู้เรียน?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#14532D] hover:underline"
          >
            ไปหน้าสมัครผู้เรียน
          </Link>
        </p>
      </form>
    </main>
  );
}
