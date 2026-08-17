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
      className="space-y-5 rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-6 shadow-sm"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#171B18]">
          ข้อมูลผู้เรียน
        </h2>
        <p className="mt-2 text-sm text-[#282B28]/75">
          ใช้สำหรับแสดงชื่อในหน้าผู้เรียนและติดตามคอร์สของคุณ
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#282B28]">
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
          className="w-full rounded-2xl border border-[#2E7D32]/25 px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10 disabled:bg-[#EEE8DD]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#282B28]">
          อีเมล
        </span>
        <input
          value={email ?? ""}
          disabled
          className="w-full rounded-2xl border border-[#2E7D32]/15 bg-[#F5F1E8] px-4 py-3 text-[#282B28]/60"
        />
      </label>

      {errorMessage && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="rounded-2xl border border-[#2E7D32]/25 bg-[#2E7D32]/10 px-4 py-3 text-sm text-[#2E7D32]">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-2xl bg-[#C63228] px-5 py-3 font-semibold text-white transition hover:bg-[#A92B23] disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
      </button>
    </form>
  );
}
