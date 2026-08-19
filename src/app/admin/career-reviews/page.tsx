import Link from "next/link";

import AdminCareerReviewsForm from "@/components/admin/AdminCareerReviewsForm";
import LogoutButton from "@/components/student/LogoutButton";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CareerReview } from "@/types/careerReview";
import type { Course } from "@/types/course";

export default async function AdminCareerReviewsPage() {
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

  const { data: careerReviews } = await supabase
    .from("career_reviews")
    .select(
      "id,title,description,youtube_url,income_text,career_type,course_id,status,created_at,updated_at"
    )
    .order("created_at", {
      ascending: false,
    })
    .returns<CareerReview[]>();

  return (
    <Container className="py-8">
      <SectionTitle
        title="จัดการคลิปรีวิวอาชีพ"
        subtitle={`แอดมิน: ${profile.full_name ?? profile.email}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[#C63228] px-5 py-3 font-semibold text-[#C63228] transition hover:bg-[#C63228]/10"
            >
              กลับ Dashboard
            </Link>
            <LogoutButton />
          </div>
        }
      />

      <AdminCareerReviewsForm
        courses={courses ?? []}
        careerReviews={careerReviews ?? []}
      />
    </Container>
  );
}
