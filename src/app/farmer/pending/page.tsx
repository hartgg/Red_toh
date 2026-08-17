import Link from "next/link";

import { requireFarmerPending } from "@/lib/auth";

export default async function FarmerPendingPage() {
  const { profile } = await requireFarmerPending();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F1E8] p-6">
      <section className="max-w-2xl rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-[#C63228]">
          RED TOH
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#171B18]">
          รอผู้ดูแลระบบอนุมัติ
        </h1>
        <p className="mt-4 leading-7 text-[#282B28]/75">
          คุณ {profile.full_name ?? profile.email} ส่งคำขอสมัครเป็นฟาร์มเมอร์แล้ว
          เมื่อผู้ดูแลระบบอนุมัติ คุณจะเข้าใช้งานแดชบอร์ดฟาร์มเมอร์และสร้างคอร์สได้
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-2xl border border-[#171B18]/15 px-5 py-3 font-semibold text-[#171B18] hover:bg-[#C63228]/10"
          >
            กลับหน้าแรก
          </Link>
          <Link
            href="/login"
            className="rounded-2xl bg-[#C63228] px-5 py-3 font-semibold text-white hover:bg-[#A92B23]"
          >
            เข้าสู่ระบบอีกครั้ง
          </Link>
        </div>
      </section>
    </main>
  );
}
