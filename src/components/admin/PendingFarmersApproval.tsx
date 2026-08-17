"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type { FarmerProfile } from "@/types/farmer";

interface PendingFarmerProfile {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface PendingFarmerRow {
  profile: PendingFarmerProfile;
  farmer: FarmerProfile | null;
}

interface PendingFarmersApprovalProps {
  pendingFarmers: PendingFarmerRow[];
}

export default function PendingFarmersApproval({
  pendingFarmers,
}: PendingFarmersApprovalProps) {
  const supabase = createClient();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function updateFarmerRole(
    userId: string,
    role: "farmer" | "student"
  ) {
    setProcessingId(userId);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        role,
      })
      .eq("id", userId)
      .eq("role", "farmer_pending");

    if (error) {
      setErrorMessage(error.message);
      setProcessingId(null);
      return;
    }

    setMessage(
      role === "farmer"
        ? "อนุมัติฟาร์มเมอร์สำเร็จ"
        : "ปฏิเสธคำขอแล้ว และปรับเป็นผู้เรียน"
    );
    setProcessingId(null);
    router.refresh();
  }

  return (
    <Card className="mb-6">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-[#171B18]">
          คำขอฟาร์มเมอร์รออนุมัติ
        </h2>
        <p className="mt-2 text-[#282B28]/75">
          ตรวจสอบข้อมูลผู้สมัครก่อนเปิดสิทธิ์สร้างคอร์ส
        </p>
      </div>

      {pendingFarmers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#171B18]/15 bg-[#FFF8EF] p-6 text-center text-[#282B28]/75">
          ยังไม่มีคำขอรออนุมัติ
        </div>
      ) : (
        <div className="space-y-4">
          {pendingFarmers.map(({ profile, farmer }) => (
            <div
              key={profile.id}
              className="rounded-3xl border border-[#171B18]/10 bg-[#FFF8EF] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#171B18]">
                    {farmer?.full_name ??
                      profile.full_name ??
                      "ไม่ระบุชื่อ"}
                  </h3>
                  <p className="mt-1 text-sm text-[#282B28]/75">
                    {profile.email ?? "ไม่ระบุอีเมล"}
                  </p>

                  <div className="mt-4 grid gap-3 text-sm text-[#282B28] sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-[#171B18]">
                        เบอร์โทร:
                      </span>{" "}
                      {farmer?.phone || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#171B18]">
                        จังหวัด:
                      </span>{" "}
                      {farmer?.province || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#171B18]">
                        พื้นที่:
                      </span>{" "}
                      {farmer?.farm_area || "-"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#171B18]">
                        ประเภทเกษตร:
                      </span>{" "}
                      {farmer?.agriculture_type || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    disabled={processingId === profile.id}
                    onClick={() =>
                      updateFarmerRole(profile.id, "farmer")
                    }
                  >
                    อนุมัติ
                  </Button>
                  <button
                    type="button"
                    disabled={processingId === profile.id}
                    onClick={() =>
                      updateFarmerRole(profile.id, "student")
                    }
                    className="rounded-2xl border border-red-200 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="mt-4 rounded-2xl border border-[#171B18]/15 bg-[#FFF8EF] px-4 py-3 text-sm text-[#C63228]">
          {message}
        </p>
      )}
    </Card>
  );
}
