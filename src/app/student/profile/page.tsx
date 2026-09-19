import Link from "next/link";

import StudentProfileForm from "@/components/student/StudentProfileForm";
import { requireStudent } from "@/lib/auth";

export default async function StudentProfilePage() {
  const { profile } = await requireStudent();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#171B18]">
            โปรไฟล์ผู้เรียน
          </h1>
          <p className="mt-2 text-[#282B28]/75">
            แก้ไขข้อมูลพื้นฐานของผู้เรียน
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-[#171B18]/15 bg-[#FFFDF7] px-5 py-3 font-semibold text-[#171B18] transition hover:bg-[#C63228]/10"
        >
          หน้าหลัก
        </Link>
      </div>

      <StudentProfileForm
        email={profile.email}
        fullName={profile.full_name}
      />
    </div>
  );
}
