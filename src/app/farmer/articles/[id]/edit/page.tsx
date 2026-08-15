import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson } from "@/types/course";
import EditCourseForm from "./EditArticleForm";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id,user_id,title,description,image_url,status,created_at,updated_at"
    )
    .eq("id", id)
    .single<Course>();

  if (!course) {
    notFound();
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id,course_id,title,description,youtube_url,lesson_order,created_at,updated_at"
    )
    .eq("course_id", course.id)
    .order("lesson_order", {
      ascending: true,
    })
    .returns<Lesson[]>();

  return (
    <Container className="py-8">
      <SectionTitle
        title="แก้ไขคอร์ส"
        subtitle="ปรับข้อมูลคอร์สและบทเรียนให้พร้อมสำหรับผู้เรียน"
      />

      <EditCourseForm
        course={course}
        lessons={lessons ?? []}
      />
    </Container>
  );
}
