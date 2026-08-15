import StudentProfileForm from "@/components/student/StudentProfileForm";
import { requireStudent } from "@/lib/auth";

export default async function StudentProfilePage() {
  const { profile } = await requireStudent();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#14532D]">
          โปรไฟล์ผู้เรียน
        </h1>
        <p className="mt-2 text-gray-600">
          แก้ไขข้อมูลพื้นฐานของผู้เรียน
        </p>
      </div>

      <StudentProfileForm
        email={profile.email}
        fullName={profile.full_name}
      />
    </div>
  );
}
