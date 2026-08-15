import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";
import CourseFilter, {
  type CourseListItem,
} from "@/components/course/CourseFilter";

export default async function FarmerArticles() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id,user_id,title,description,image_url,status,created_at,updated_at"
    )
    .order("created_at", {
      ascending: false,
    });

  return (
    <Container className="py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SectionTitle
          title="คอร์สของฉัน"
          subtitle="จัดการคอร์สเรียนทั้งหมดของคุณ"
        />

        <Link href="/farmer/articles/create">
          <Button>+ สร้างคอร์ส</Button>
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <EmptyState
          title="ยังไม่มีคอร์ส"
          subtitle="เริ่มสร้างคอร์สแรกของคุณ เพื่อแบ่งปันความรู้ให้ผู้เรียน"
        />
      ) : (
        <CourseFilter
          courses={courses as CourseListItem[]}
        />
      )}
    </Container>
  );
}
