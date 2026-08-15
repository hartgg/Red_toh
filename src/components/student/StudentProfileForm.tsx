"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface StudentProfileFormProps {
  email: string | null;
  fullName: string | null;
}

export default function StudentProfileForm({
  email,
  fullName,
}: StudentProfileFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(fullName ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const normalizedName = name.trim();

    if (!normalizedName) {
      setErrorMessage("กรุณากรอกชื่อผู้เรียน");
      setSaving(false);
      return;
    }

    const { error } = await supabase.rpc(
      "update_own_profile_name",
      {
        p_full_name: normalizedName,
      }
    );

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setName(normalizedName);
    setMessage("บันทึกโปรไฟล์สำเร็จ");
    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-green-100 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#14532D]">
          ข้อมูลผู้เรียน
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          ใช้สำหรับแสดงชื่อในหน้าผู้เรียนและติดตามคอร์สของคุณ
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-gray-700">
          ชื่อผู้เรียน
        </span>
        <input
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setMessage("");
            setErrorMessage("");
          }}
          disabled={saving}
          className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-[#14532D] focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-gray-700">
          อีเมล
        </span>
        <input
          value={email ?? ""}
          disabled
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
        />
      </label>

      {errorMessage && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-2xl bg-[#14532D] px-5 py-3 font-semibold text-white transition hover:bg-[#166534] disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
      </button>
    </form>
  );
}
