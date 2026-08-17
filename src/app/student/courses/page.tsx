import Link from "next/link";

import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import type { CourseEnrollment } from "@/types/studentLearning";

export default async function StudentCoursesPage() {
  const { user } = await requireStudent();
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select("id,course_id,user_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .returns<CourseEnrollment[]>();

  const courseIds = [
    ...new Set((enrollments ?? []).map((item) => item.course_id)),
  ];

  const { data: courses } =
    courseIds.length > 0
      ? await supabase
          .from("courses")
          .select(
            "id,user_id,title,description,image_url,status,created_at,updated_at"
          )
          .in("id", courseIds)
          .returns<Course[]>()
      : { data: [] };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#171B18]">
          คอร์สของฉัน
        </h1>
        <p className="mt-2 text-[#282B28]/75">
          รวมคอร์สที่คุณสมัครเรียนไว้ทั้งหมด
        </p>
      </div>

      {(courses ?? []).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#171B18]/15 bg-[#FFFDF7] p-10 text-center text-[#282B28]/75">
          ยังไม่มีคอร์สในรายการของคุณ
          <div className="mt-5">
            <Link
              href="/courses"
              className="inline-flex rounded-2xl bg-[#C63228] px-5 py-3 font-semibold text-white"
            >
              เลือกคอร์สเรียน
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(courses ?? []).map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-[#171B18]">
                {course.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#282B28]/75">
                {course.description}
              </p>
              <span className="mt-5 inline-flex rounded-full bg-[#C63228]/15 px-3 py-1 text-xs font-semibold text-[#C63228]">
                เข้าเรียน
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
