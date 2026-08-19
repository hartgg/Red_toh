import Link from "next/link";

import AdminCareerReviewCreateForm from "@/components/admin/AdminCareerReviewCreateForm";
import LogoutButton from "@/components/student/LogoutButton";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";

export default async function CreateCareerReviewPage() {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id,user_id,title,description,image_url,status,created_at,updated_at"
    )
    .eq("status", "published")
    .order("created_at", {
      ascending: false,
    })
    .returns<Course[]>();

  return (
    <Container className="py-8">
      <SectionTitle
        title="เพิ่มคลิปรีวิวอาชีพ"
        subtitle={`แอดมิน: ${profile.full_name ?? profile.email}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/career-reviews"
              className="inline-flex items-center justify-center rounded-xl border border-[#C63228] px-5 py-3 font-semibold text-[#C63228] transition hover:bg-[#C63228]/10"
            >
              กลับหน้าคลิปทั้งหมด
            </Link>
            <LogoutButton />
          </div>
        }
      />

      <AdminCareerReviewCreateForm
        courses={courses ?? []}
      />
    </Container>
  );
}
