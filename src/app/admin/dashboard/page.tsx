import AdminHomepageGoalCardsForm from "@/components/admin/AdminHomepageGoalCardsForm";
import AdminFeaturedCareersForm from "@/components/admin/AdminFeaturedCareersForm";
import AdminCareerReviewsForm from "@/components/admin/AdminCareerReviewsForm";
import PendingFarmersApproval from "@/components/admin/PendingFarmersApproval";
import LogoutButton from "@/components/student/LogoutButton";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import type { FarmerProfile } from "@/types/farmer";
import type { FeaturedCareer } from "@/types/featuredCareer";
import type { HomepageGoalCardImage } from "@/types/homepageGoalCard";
import type { CareerReview } from "@/types/careerReview";

interface PendingProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "farmer_pending";
}

export default async function AdminDashboard() {
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

  const { data: featuredCareers } = await supabase
    .from("featured_careers")
    .select(
      "id,slot,course_id,image_url,created_at,updated_at"
    )
    .order("slot", {
      ascending: true,
    })
    .returns<FeaturedCareer[]>();

  const { data: careerReviews } = await supabase
    .from("career_reviews")
    .select(
      "id,title,description,youtube_url,income_text,career_type,course_id,status,created_at,updated_at"
    )
    .order("created_at", {
      ascending: false,
    })
    .returns<CareerReview[]>();

  const { data: goalImages } = await supabase
    .from("homepage_goal_cards")
    .select("id,goal,image_url,created_at,updated_at")
    .returns<HomepageGoalCardImage[]>();

  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("role", "farmer_pending")
    .returns<PendingProfile[]>();

  const pendingProfileRows = pendingProfiles ?? [];
  const pendingUserIds = pendingProfileRows.map(
    (pendingProfile) => pendingProfile.id
  );

  const { data: farmerProfiles } =
    pendingUserIds.length > 0
      ? await supabase
          .from("farmers")
          .select(
            "user_id,full_name,phone,province,farm_area,agriculture_type"
          )
          .in("user_id", pendingUserIds)
          .returns<FarmerProfile[]>()
      : { data: [] };

  const farmerProfileMap = new Map(
    (farmerProfiles ?? []).map((farmerProfile) => [
      farmerProfile.user_id,
      farmerProfile,
    ])
  );

  return (
    <Container className="py-8">
      <SectionTitle
        title="Admin Dashboard"
        subtitle={`ยินดีต้อนรับ ${profile.full_name ?? profile.email}`}
        action={<LogoutButton />}
      />

      <PendingFarmersApproval
        pendingFarmers={pendingProfileRows.map(
          (pendingProfile) => ({
            profile: pendingProfile,
            farmer:
              farmerProfileMap.get(pendingProfile.id) ??
              null,
          })
        )}
      />

      <AdminFeaturedCareersForm
        courses={courses ?? []}
        featuredCareers={featuredCareers ?? []}
      />

      <div className="mt-6">
        <AdminCareerReviewsForm
          courses={courses ?? []}
          careerReviews={careerReviews ?? []}
        />
      </div>

      <div className="mt-6">
        <AdminHomepageGoalCardsForm
          goalImages={goalImages ?? []}
        />
      </div>
    </Container>
  );
}
