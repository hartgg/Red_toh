"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

interface FarmerProfileFormProps {
  userId: string;
}

interface FarmerFormState {
  full_name: string;
  phone: string;
  province: string;
  farm_area: string;
  agriculture_type: string;
}

const emptyForm: FarmerFormState = {
  full_name: "",
  phone: "",
  province: "",
  farm_area: "",
  agriculture_type: "",
};

function normalizeForm(form: FarmerFormState) {
  return {
    full_name: form.full_name.trim(),
    phone: form.phone.trim(),
    province: form.province.trim(),
    farm_area: form.farm_area.trim(),
    agriculture_type: form.agriculture_type.trim(),
  };
}

function isValidPhone(phone: string) {
  if (!phone) {
    return true;
  }

  return /^[0-9+\-\s()]{8,20}$/.test(phone);
}

export default function FarmerProfileForm({
  userId,
}: FarmerProfileFormProps) {
  const supabase = useMemo(() => createClient(), []);

  const [form, setForm] =
    useState<FarmerFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("farmers")
        .select(
          "full_name, phone, province, farm_area, agriculture_type"
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setErrorMessage(
          `โหลดข้อมูลโปรไฟล์ไม่สำเร็จ: ${error.message}`
        );
        setLoading(false);
        return;
      }

      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          province: data.province ?? "",
          farm_area: data.farm_area ?? "",
          agriculture_type: data.agriculture_type ?? "",
        });
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [supabase, userId]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
    setMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const normalizedForm = normalizeForm(form);

    if (!normalizedForm.full_name) {
      setErrorMessage("กรุณากรอกชื่อ-นามสกุล");
      setSaving(false);
      return;
    }

    if (!normalizedForm.province) {
      setErrorMessage("กรุณากรอกจังหวัด");
      setSaving(false);
      return;
    }

    if (!isValidPhone(normalizedForm.phone)) {
      setErrorMessage(
        "กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 0812345678"
      );
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("farmers").upsert(
      {
        user_id: userId,
        ...normalizedForm,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setForm(normalizedForm);
    setMessage("บันทึกข้อมูลสำเร็จ");
    setSaving(false);
  }

  if (loading) {
    return (
      <Card>
        <p className="text-[#282B28]/75">
          กำลังโหลดข้อมูลโปรไฟล์...
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block font-medium text-[#171B18]">
              ชื่อ-นามสกุล
            </label>

            <input
              name="full_name"
              value={form.full_name}
              placeholder="เช่น สมชาย ใจดี"
              onChange={handleChange}
              disabled={saving}
              required
              className="w-full rounded-2xl border border-[#171B18]/15 px-4 py-3 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10 disabled:cursor-not-allowed disabled:bg-[#EEE8DD]"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-[#171B18]">
              เบอร์โทรศัพท์
            </label>

            <input
              name="phone"
              value={form.phone}
              placeholder="เช่น 0812345678"
              onChange={handleChange}
              disabled={saving}
              inputMode="tel"
              className="w-full rounded-2xl border border-[#171B18]/15 px-4 py-3 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10 disabled:cursor-not-allowed disabled:bg-[#EEE8DD]"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-[#171B18]">
              จังหวัด
            </label>

            <input
              name="province"
              value={form.province}
              placeholder="เช่น เชียงใหม่"
              onChange={handleChange}
              disabled={saving}
              required
              className="w-full rounded-2xl border border-[#171B18]/15 px-4 py-3 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10 disabled:cursor-not-allowed disabled:bg-[#EEE8DD]"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-[#171B18]">
              พื้นที่ทำการเกษตร
            </label>

            <input
              name="farm_area"
              value={form.farm_area}
              placeholder="เช่น 10 ไร่"
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-2xl border border-[#171B18]/15 px-4 py-3 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10 disabled:cursor-not-allowed disabled:bg-[#EEE8DD]"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-[#171B18]">
              ประเภทเกษตรที่ทำ
            </label>

            <input
              name="agriculture_type"
              value={form.agriculture_type}
              placeholder="เช่น ปลูกข้าว ทำสวนผลไม้ เลี้ยงปลา"
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-2xl border border-[#171B18]/15 px-4 py-3 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10 disabled:cursor-not-allowed disabled:bg-[#EEE8DD]"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {message && (
          <p className="rounded-2xl border border-[#171B18]/15 bg-[#FFF8EF] px-4 py-3 text-sm text-[#C63228]">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-[#171B18]/10 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "กำลังบันทึก..."
              : "บันทึกข้อมูลโปรไฟล์"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
