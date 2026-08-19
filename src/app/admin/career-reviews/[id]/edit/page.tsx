import Link from "next/link";
import { notFound } from "next/navigation";

import AdminCareerReviewEditForm from "@/components/admin/AdminCareerReviewEditForm";
import LogoutButton from "@/components/student/LogoutButton";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CareerReview } from "@/types/careerReview";
import type { Course } from "@/types/course";

interface EditCareerReviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCareerReviewPage({
  params,
}: EditCareerReviewPageProps) {
  const { id } = await params;
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const { data: careerReview } = await supabase
    .from("career_reviews")
    .select(
      "id,title,description,youtube_url,income_text,career_type,course_id,status,created_at,updated_at"
    )
    .eq("id", id)
    .maybeSingle<CareerReview>();

  if (!careerReview) {
    notFound();
  }

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
        title="แก้ไขคลิปรีวิวอาชีพ"
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

      <AdminCareerReviewEditForm
        careerReview={careerReview}
        courses={courses ?? []}
      />
    </Container>
  );
}
