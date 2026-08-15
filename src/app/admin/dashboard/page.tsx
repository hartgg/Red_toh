import AdminFeaturedCareersForm from "@/components/admin/AdminFeaturedCareersForm";
import PendingFarmersApproval from "@/components/admin/PendingFarmersApproval";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import type { FarmerProfile } from "@/types/farmer";
import type { FeaturedCareer } from "@/types/featuredCareer";

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
    </Container>
  );
}
